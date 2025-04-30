<?php
// File: backend/invoices/Invoice.php

require_once("../db/dbaccess.php");
require_once("../../vendor/fpdf186/fpdf.php");

session_start();
if (!isset($_SESSION['user']['id']) || !isset($_GET['orderId'])) {
    header('HTTP/1.1 403 Forbidden');
    exit('Unauthorized');
}
$userId  = $_SESSION['user']['id'];
$orderId = intval($_GET['orderId']);

// 1) Read order + customer
$stmt = $conn->prepare("
  SELECT o.id, o.created_at, o.subtotal, o.discount, o.shipping_amount, o.total_amount,
         u.firstname, u.lastname, u.address, u.zip_code, u.city, u.country
  FROM orders o
  JOIN users  u ON u.id = o.user_id
  WHERE o.id = ? AND o.user_id = ?
");
$stmt->bind_param("ii", $orderId, $userId);
$stmt->execute();
$order = $stmt->get_result()->fetch_assoc();
if (!$order) {
    header('HTTP/1.1 404 Not Found');
    exit('Order not found');
}

// 2) Read items
$stmt = $conn->prepare("
  SELECT product_id, name_snapshot, price_snapshot, quantity, total_price
  FROM order_items
  WHERE order_id = ?
");
$stmt->bind_param("i", $orderId);
$stmt->execute();
$items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// --- Helpers ---
function utf(string $text): string {
    return utf8_decode($text);
}
function euro(float $num): string {
    // WinAnsi-Euro: chr(128)
    return number_format($num, 2, ',', '.') . ' ' . chr(128);
}

// 3) PDF class
class InvoicePDF extends FPDF {
    private $order;
    public function __construct(array $order) {
        parent::__construct('P','mm','A4');
        $this->order = $order;
    }
    function Header() {
        // --- LEFT: Bill To ---
        $this->SetFont('Arial','B',12);
        $this->SetXY(10,35);
        $this->Cell(0,6, utf('Bill To:'), 0,1);
        $this->SetFont('Arial','',10);
        foreach([
            $this->order['firstname'].' '.$this->order['lastname'],
            $this->order['address'],
            $this->order['zip_code'].' '.$this->order['city'],
            $this->order['country']
        ] as $line) {
            $this->SetX(10);
            $this->Cell(0,6, utf($line), 0,1);
        }

        // --- RIGHT: Logo + Company Info ---
        // Logo
        $this->Image('../../pictures/GamerHaven_Logo.png',160,-5,45);
        // Company
        $this->SetFont('Arial','B',11);
        $y = 10 + 20 + 2; // unter Logo
        $this->SetXY(150,$y);
        $this->Cell(0,6, utf('GamerHaven GmbH'), 0,1,'R');
        $this->SetFont('Arial','',9);
        foreach([
            'Höchstädtplatz 6',
            '1200 Vienna, Austria',
            'Email: info@gamerhaven.com',
            'IBAN AT12 3456 7890 1234 5678',
            'BIC: GAHVATWWXXX'
        ] as $line) {
            $this->SetX(150);
            $this->Cell(0,5, utf($line), 0,1,'R');
        }

        // Horizontal line
        $this->Ln(4);
        $this->Line(10, $this->GetY(), 200, $this->GetY());
        $this->Ln(10);
    }
    function Footer() {
        $this->SetY(-25);
        $this->SetFont('Arial','I',8);
        $this->Cell(0,5, utf('Payable within 14 days without deduction.'), 0,1,'C');
        $this->Cell(0,5, utf('Questions? info@gamerhaven.com • +43 1 2345678'), 0,0,'C');
    }
}

// 4) Build PDF
$pdf = new InvoicePDF($order);
$pdf->AddPage();
$pdf->SetAutoPageBreak(true,30);

// — Title —
$pdf->SetFont('Arial','B',16);
$pdf->Cell(0,8, utf('INVOICE'), 0,1,'C');
$pdf->Ln(2);

// — Metadata (Invoice #, Date) —
$pdf->SetFont('Arial','',11);
$pdf->Cell(100,6, utf('Invoice #: ').$order['id'],0,0);
$pdf->Cell(0,6, utf('Date: ').substr($order['created_at'],0,10),0,1,'R');
$pdf->Ln(5);

// — Table header —
$pdf->SetFont('Arial','B',10);
$pdf->SetFillColor(240,240,240);
$w = [10, 25, 85, 20, 25, 25];
$pdf->Cell($w[0],8,'#',1,0,'C',true);
$pdf->Cell($w[1],8,'Item No.',1,0,'C',true);
$pdf->Cell($w[2],8,'Description',1,0,'C',true);
$pdf->Cell($w[3],8,'Qty',1,0,'C',true);
$pdf->Cell($w[4],8,'Unit Price',1,0,'C',true);
$pdf->Cell($w[5],8,'Total',1,1,'C',true);

// — Table content —
$pdf->SetFont('Arial','',9);
$i = 1;
foreach ($items as $it) {
    $pdf->Cell($w[0],6,$i++,1,0,'C');
    $pdf->Cell($w[1],6,$it['product_id'],1,0,'C');
    $pdf->Cell($w[2],6,utf(substr($it['name_snapshot'],0,40)),1,0,'L');
    $pdf->Cell($w[3],6,$it['quantity'],1,0,'C');
    $pdf->Cell($w[4],6,euro($it['price_snapshot']),1,0,'R');
    $pdf->Cell($w[5],6,euro($it['total_price']),1,1,'R');
}

// — Totals —
$pdf->Ln(4);
$pdf->SetFont('Arial','B',10);
$pdf->Cell(array_sum(array_slice($w,0,4)));
$pdf->Cell($w[4],6, utf('Subtotal:'),0,0,'R');
$pdf->Cell($w[5],6,euro($order['subtotal']),1,1,'R');

$pdf->Cell(array_sum(array_slice($w,0,4)));
$pdf->Cell($w[4],6, utf('Discount:'),0,0,'R');
$pdf->Cell($w[5],6,'-'.euro($order['discount']),1,1,'R');

$pdf->Cell(array_sum(array_slice($w,0,4)));
$pdf->Cell($w[4],6, utf('Shipping:'),0,0,'R');
$pdf->Cell($w[5],6,euro($order['shipping_amount']),1,1,'R');

$pdf->SetFont('Arial','B',12);
$pdf->Cell(array_sum(array_slice($w,0,4)));
$pdf->Cell($w[4],8, utf('TOTAL:'),0,0,'R');
$pdf->Cell($w[5],8,euro($order['total_amount']),1,1,'R');

// 5) Output
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="invoice_'.$orderId.'.pdf"');
$pdf->Output('I','invoice_'.$orderId.'.pdf');
exit;
