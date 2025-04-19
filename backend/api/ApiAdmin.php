<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../db/dbaccess.php';
require_once __DIR__ . '/../controller/AdminController.php';

if (!isset($_SESSION['user']['id']) || $_SESSION['user']['role'] !== 'admin') {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit;
}

$ctrl = new AdminController();
$conn = $GLOBALS['conn'];
$qs   = array_keys($_GET)[0] ?? '';

try {
  switch ($_SERVER['REQUEST_METHOD'].'?'.$qs) {
    // PRODUCTS
    case 'GET?listProducts':
      echo json_encode($ctrl->listProducts($conn));
      break;
    case 'GET?getProduct':
      echo json_encode($ctrl->getProduct((int)$_GET['id'], $conn));
      break;
    case 'POST?addProduct':
    case 'POST?updateProduct':
      echo json_encode($ctrl->saveProduct($_POST, $_FILES, $conn));
      break;
    case 'POST?deleteProduct':
      echo json_encode($ctrl->deleteProduct((int)$_GET['id'], $conn));
      break;

    // CUSTOMERS
    case 'GET?listCustomers':
      echo json_encode($ctrl->listCustomers($conn));
      break;
    case 'GET?getCustomer':
      echo json_encode($ctrl->getCustomer((int)$_GET['id'], $conn));
      break;
    case 'POST?toggleCustomer':
      echo json_encode($ctrl->toggleCustomer((int)$_GET['id'], $conn));
      break;
    case 'POST?addCustomer':
    case 'POST?updateCustomer':
      $data = json_decode(file_get_contents('php://input'), true);
      echo json_encode($ctrl->saveCustomer($data, $conn));
      break;

    // VOUCHERS
    case 'GET?listVouchers':
      echo json_encode($ctrl->listVouchers($conn));
      break;
    case 'GET?getVoucher':
      echo json_encode($ctrl->getVoucher((int)$_GET['id'], $conn));
      break;
    case 'POST?addVoucher':
    case 'POST?updateVoucher':
      $data = json_decode(file_get_contents('php://input'), true);
      echo json_encode($ctrl->saveVoucher($data, $conn));
      break;
    case 'POST?deleteVoucher':
      echo json_encode($ctrl->deleteVoucher((int)$_GET['id'], $conn));
      break;

    default:
      http_response_code(400);
      echo json_encode(['error' => 'Invalid request']);
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Server error: '.$e->getMessage()]);
}
