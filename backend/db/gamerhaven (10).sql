-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 21. Apr 2025 um 10:44
-- Server-Version: 10.4.32-MariaDB
-- PHP-Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `gamerhaven`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `product_id`, `quantity`, `created_at`) VALUES
(52, 1, 23, 1, '2025-04-21 08:35:05');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `voucher_id` int(11) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `shipping_amount` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `payment_id`, `voucher_id`, `subtotal`, `discount`, `shipping_amount`, `total_amount`, `created_at`) VALUES
(12, 2, 9, NULL, 759.96, 0.00, 0.00, 759.96, '2025-04-16 16:19:04'),
(15, 2, 9, 1, 169.98, 10.00, 9.90, 174.97, '2025-04-16 17:45:56'),
(16, 2, 9, NULL, 79.99, 0.00, 9.90, 84.98, '2025-04-16 20:42:24'),
(17, 1, 8, NULL, 249.98, 0.00, 9.90, 259.88, '2025-04-16 22:12:52'),
(18, 2, 9, NULL, 129.99, 0.00, 9.90, 139.89, '2025-04-17 14:49:49'),
(19, 1, 8, NULL, 529.96, 0.00, 0.00, 529.96, '2025-04-18 12:39:38'),
(20, 2, 9, NULL, 129.99, 0.00, 9.90, 139.89, '2025-04-18 12:40:43'),
(21, 2, 9, NULL, 249.98, 0.00, 9.90, 259.88, '2025-04-18 14:45:55');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `name_snapshot` varchar(255) NOT NULL,
  `price_snapshot` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `name_snapshot`, `price_snapshot`, `quantity`, `total_price`) VALUES
(1, 12, 14, 'Acer Predator XB271HU', 449.99, 1, 449.00),
(2, 12, 7, 'HyperX Cloud II', 99.99, 1, 99.00),
(3, 12, 2, 'Logitech G502 Hero', 79.99, 1, 79.00),
(4, 12, 5, 'Razer BlackWidow V3', 129.99, 1, 129.00),
(5, 15, 1, 'Razer Viper Ultimate', 129.99, 1, 129.99),
(6, 15, 12, '8BitDo SN30 Pro', 49.99, 1, 49.99),
(7, 16, 2, 'Logitech G502 Hero', 79.99, 1, 79.99),
(8, 17, 1, 'Razer Viper Ultimate', 129.99, 1, 129.99),
(9, 17, 8, 'Logitech G Pro X', 119.99, 1, 119.99),
(10, 18, 1, 'Razer Viper Ultimate', 129.99, 1, 129.99),
(11, 19, 1, 'Razer Viper Ultimate', 129.99, 1, 129.99),
(12, 19, 3, 'SteelSeries Rival 600', 89.99, 1, 89.99),
(13, 19, 4, 'Corsair K95 RGB', 199.99, 1, 199.99),
(14, 19, 6, 'SteelSeries Apex 5', 109.99, 1, 109.99),
(15, 20, 1, 'Razer Viper Ultimate', 129.99, 1, 129.99),
(16, 21, 1, 'Razer Viper Ultimate', 129.99, 1, 129.99),
(17, 21, 8, 'Logitech G Pro X', 119.99, 1, 119.99);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `method` enum('Credit Card','PayPal','Bank Transfer') NOT NULL,
  `card_number` varchar(25) DEFAULT NULL,
  `csv` varchar(5) DEFAULT NULL,
  `paypal_email` varchar(100) DEFAULT NULL,
  `paypal_username` varchar(50) DEFAULT NULL,
  `iban` varchar(34) DEFAULT NULL,
  `bic` varchar(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `payments`
--

INSERT INTO `payments` (`id`, `user_id`, `method`, `card_number`, `csv`, `paypal_email`, `paypal_username`, `iban`, `bic`, `created_at`) VALUES
(8, 1, 'Credit Card', '2345675432121345', '123', NULL, NULL, NULL, NULL, '2025-04-11 20:44:57'),
(9, 2, 'Credit Card', '2345675432121345', '1232', NULL, NULL, NULL, NULL, '2025-04-11 21:23:15'),
(10, 3, 'Credit Card', '2345675432121345', '1232', NULL, NULL, NULL, NULL, '2025-04-12 17:58:30'),
(11, 4, 'Credit Card', '2222222222222', '213', NULL, NULL, NULL, NULL, '2025-04-12 18:12:26'),
(12, 2, 'PayPal', NULL, NULL, 'localhost.doorbell565@passinbox.com', NULL, NULL, NULL, '2025-04-18 20:28:46'),
(13, 2, 'Bank Transfer', NULL, NULL, NULL, NULL, 'AT1203i932094234932', 'BKAUAAUTEWE', '2025-04-18 20:37:39');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `brand` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `sub_category` varchar(100) DEFAULT NULL,
  `attributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`attributes`)),
  `image_url` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`image_url`)),
  `rating` decimal(3,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `brand`, `category`, `sub_category`, `attributes`, `image_url`, `rating`, `created_at`) VALUES
(1, 'Razer Viper Ultimate', 'The Razer Viper Ultimate is a high-end wireless gaming mouse featuring a 20,000 DPI optical sensor for ultra-precise movements. With Razer HyperSpeed technology, it delivers lightning-fast responsiveness and industry-leading low latency. It also includes a charging dock and customizable Chroma RGB lighting for personalized flair.', 129.99, 50, 'Razer', 'Mouse', 'Wireless', '{\"Sensor\": \"Optical\", \"DPI\": \"20000\", \"Wireless\": \"Yes\", \"RGB\": \"Yes\", \"Weight\": \"74g\", \"Battery Life\": \"70h\"}', '[\"pictures/Mouse_RazerViperUltimate.jpg\", \"pictures/Mouse_RazerViperUltimate_2.jpg\", \"pictures/Mouse_RazerViperUltimate_3.jpg\"]', 4.80, '2025-04-12 21:09:00'),
(2, 'Logitech G502 Hero', 'Designed for performance gamers, the Logitech G502 HERO offers a 16,000 DPI sensor with pixel-perfect tracking. It features customizable weights, 11 programmable buttons, and onboard profiles to tailor your experience. The ergonomic shape ensures comfort during long gaming sessions.', 79.99, 60, 'Logitech', 'Mouse', 'Wired', '{\"Sensor\": \"HERO\", \"DPI\": \"16000\", \"Wired\": \"Yes\", \"Weights\": \"5x3.6g\", \"RGB\": \"Yes\", \"Buttons\": \"11\"}', '[\"pictures/Mouse_LogitechG502Hero.jpg\", \"pictures/Mouse_LogitechG502Hero_2.jpg\", \"pictures/Mouse_LogitechG502Hero_3.jpg\"]', 4.70, '2025-04-12 21:09:00'),
(3, 'SteelSeries Rival 600', 'The Rival 600 combines dual-sensor precision with true 1-to-1 tracking and advanced lift-off distance detection. Its weight tuning system and split-trigger buttons make it ideal for competitive FPS gaming. The RGB zones are fully customizable for immersive aesthetics.', 89.99, 45, 'SteelSeries', 'Mouse', 'Wired', '{\"Sensor\": \"TrueMove3+Depth\", \"DPI\": \"12000\", \"Wired\": \"Yes\", \"Weight Tuning\": \"Yes\", \"RGB\": \"Yes\", \"Liftoff Sensor\": \"Yes\"}', '[\"pictures/Mouse_SteelSeriesRival600.jpg\", \"pictures/Mouse_SteelSeriesRival600_2.jpg\", \"pictures/Mouse_SteelSeriesRival600_3.jpg\"]', 4.60, '2025-04-12 21:09:00'),
(4, 'Corsair K95 RGB', 'The Corsair K95 RGB is a premium mechanical keyboard featuring Cherry MX switches and 6 dedicated macro keys. Its aluminum frame, per-key dynamic RGB backlighting, and USB passthrough make it a powerful tool for both gaming and productivity. Built for durability and precision.', 199.99, 60, 'Corsair', 'Keyboard', 'Mechanical', '{\"Switches\": \"Cherry MX RGB\", \"Layout\": \"Full-Size\", \"Macro Keys\": \"6\", \"RGB\": \"Per-Key\", \"Onboard Profiles\": \"Yes\", \"Frame\": \"Aluminum\"}', '[\"pictures/Keyboard_CorsairK95RGB.jpg\", \"pictures/Keyboard_CorsairK95RGB_2.jpg\", \"pictures/Keyboard_CorsairK95RGB_3.jpg\"]', 4.90, '2025-04-12 21:09:00'),
(5, 'Razer BlackWidow V3', 'Featuring Razer Green mechanical switches, the BlackWidow V3 offers tactile feedback and fast actuation. With dedicated media controls, ergonomic wrist rest, and full Chroma RGB lighting, it combines performance with comfort and style. Built to handle intense gaming demands.', 129.99, 70, 'Razer', 'Keyboard', 'Mechanical', '{\"Switches\": \"Razer Green\", \"RGB\": \"Yes\", \"Media Keys\": \"Yes\", \"USB\": \"Wired\", \"Wrist Rest\": \"Detachable\", \"N-Key Rollover\": \"Yes\"}', '[\"pictures/Keyboard_RazerBlackWidowV3.jpg\", \"pictures/Keyboard_RazerBlackWidowV3_2.jpg\", \"pictures/Keyboard_RazerBlackWidowV3_3.jpg\"]', 4.70, '2025-04-12 21:09:00'),
(6, 'SteelSeries Apex 5', 'The Apex 5 combines the smoothness of membrane switches with the tactile feel of mechanical keys in a hybrid design. It features a stunning per-key RGB setup, an OLED smart display, and aircraft-grade aluminum frame for strength and aesthetics. A perfect balance of innovation and style.', 109.99, 85, 'SteelSeries', 'Keyboard', 'Hybrid', '{\"Switches\": \"Hybrid Mechanical\", \"RGB\": \"Per-Key\", \"OLED Display\": \"Yes\", \"Frame\": \"Aluminum\", \"Layout\": \"Full-Size\"}', '[\"pictures/Keyboard_SteelSeriesApex5.jpg\", \"pictures/Keyboard_SteelSeriesApex5_2.jpg\", \"pictures/Keyboard_SteelSeriesApex5_3.jpg\"]', 4.60, '2025-04-12 21:09:00'),
(7, 'HyperX Cloud II', 'The HyperX Cloud II is a legendary gaming headset known for its comfort and sound quality. It features virtual 7.1 surround sound, memory foam ear cushions, and a detachable noise-canceling microphone. Ideal for immersive play and long sessions.', 99.99, 40, 'HyperX', 'Headset', 'Wired', '{\"Driver Size\": \"53mm\", \"Surround\": \"Virtual 7.1\", \"Mic\": \"Detachable\", \"Wired\": \"Yes\", \"Frequency Range\": \"15–25kHz\", \"Connector\": \"USB & 3.5mm\"}', '[\"pictures/Headset_HyperXCloudII.jpg\", \"pictures/Headset_HyperXCloudII_2.jpg\", \"pictures/Headset_HyperXCloudII_3.jpg\"]', 4.80, '2025-04-12 21:09:00'),
(8, 'Logitech G Pro X', 'Developed in collaboration with esports professionals, the G Pro X delivers clear positional sound and voice communication. It features advanced DTS:X surround sound and a detachable BLUE VO!CE microphone with real-time filters. Built for competitive dominance.', 119.99, 55, 'Logitech', 'Headset', 'Wired', '{\"Surround\": \"DTS:X 2.0\", \"Mic\": \"Detachable BLUE VO!CE\", \"Connection\": \"Wired\", \"Ear Cushions\": \"Memory Foam\", \"Weight\": \"320g\"}', '[\"pictures/Headset_LogitechGProX.jpg\", \"pictures/Headset_LogitechGProX_2.jpg\", \"pictures/Headset_LogitechGProX_3.jpg\"]', 4.70, '2025-04-12 21:09:00'),
(9, 'SteelSeries Arctis 7', 'The Arctis 7 offers lossless 2.4GHz wireless audio with ultra-low latency and a 24-hour battery life. Its retractable ClearCast mic delivers studio-quality voice clarity. With award-winning comfort and premium sound, it\'s perfect for marathon gaming.', 159.99, 0, 'SteelSeries', 'Headset', 'Wireless', '{\"Wireless\":\"2.4GHz Lossless\",\"Battery\":\"24h\",\"Mic\":\"Retractable\",\"Charging\":\"USB\",\"Frequency Range\":\"20–20kHz\",\"Range\":\"12m\"}', '[\"pictures/Headset_SteelSeriesArctis7.jpg\",\"pictures/Headset_SteelSeriesArctis7_2.jpg\",\"pictures/Headset_SteelSeriesArctis7_3.jpg\"]', 4.60, '2025-04-12 21:09:00'),
(10, 'Xbox Wireless Controller', 'The official Xbox Wireless Controller features a refined design with a hybrid D-pad, textured grip, and wireless Bluetooth support. Play across Xbox consoles, PCs, and mobile devices with ease. Reliable, responsive, and built to perform.', 59.99, 90, 'Microsoft', 'Controller', 'Wireless', '{\"Platform\": \"Xbox/PC\", \"Wireless\": \"Bluetooth & Xbox Wireless\", \"Battery\": \"AA\", \"Ports\": \"USB-C\", \"D-Pad\": \"Hybrid\"}', '[\"pictures/Controller_XboxWirelessController.jpg\", \"pictures/Controller_XboxWirelessController_2.jpg\", \"pictures/Controller_XboxWirelessController_3.jpg\"]', 4.50, '2025-04-12 21:09:00'),
(11, 'PlayStation DualSense', 'The DualSense controller redefines immersion with adaptive triggers and haptic feedback that simulate in-game actions. Its futuristic design and built-in microphone make it the ultimate PlayStation 5 accessory. Feel every explosion and motion in stunning detail.', 69.99, 80, 'Sony', 'Controller', 'Wireless', '{\"Platform\": \"PS5/PC\", \"Haptics\": \"Adaptive Triggers\", \"Motion Sensor\": \"Yes\", \"Battery\": \"Rechargeable\", \"Charging\": \"USB-C\"}', '[\"pictures/Controller_PlayStationDualSense.jpg\", \"pictures/Controller_PlayStationDualSense_2.jpg\", \"pictures/Controller_PlayStationDualSense_3.jpg\"]', 4.80, '2025-04-12 21:09:00'),
(12, '8BitDo SN30 Pro', 'The 8BitDo SN30 Pro blends retro style with modern technology, offering wireless play, motion controls, rumble, and USB-C charging. It\'s fully compatible with PC, Android, and Nintendo Switch. A must-have for nostalgic gamers with modern needs.', 49.99, 40, '8BitDo', 'Controller', 'Wireless', '{\"Platform\": \"PC/Switch/Android\", \"Connectivity\": \"Bluetooth, USB-C\", \"Vibration\": \"Yes\", \"Design\": \"Retro\", \"D-Pad\": \"Precision\"}', '[\"pictures/Controller_8BitDoSN30Pro.jpg\", \"pictures/Controller_8BitDoSN30Pro_2.jpg\", \"pictures/Controller_8BitDoSN30Pro_3.jpg\"]', 4.00, '2025-04-12 21:09:00'),
(13, 'ASUS ROG Swift PG279Q', 'This 27\" WQHD monitor delivers 165Hz refresh rate, G-Sync support, and stunning color accuracy. Designed for esports and FPS gamers, it minimizes motion blur while maintaining crisp detail. Ergonomic design and ultra-thin bezels complete the package.', 499.99, 20, 'ASUS', 'Monitor', '27 inch', '{\"Screen\": \"27\\\"\", \"Resolution\": \"2560x1440\", \"Panel\": \"IPS\", \"Refresh Rate\": \"165Hz\", \"G-Sync\": \"Yes\", \"Ports\": \"HDMI, DP\"}', '[\"pictures/Monitor_ASUSROGSwiftPG279Q.jpg\", \"pictures/Monitor_ASUSROGSwiftPG279Q_2.jpg\", \"pictures/Monitor_ASUSROGSwiftPG279Q_3.jpg\"]', 4.90, '2025-04-12 21:09:00'),
(14, 'Acer Predator XB271HU', 'The Acer Predator XB271HU features a 27\" IPS panel with 144Hz refresh rate and NVIDIA G-Sync technology. With vivid colors, fast response time, and zero screen tearing, it\'s a top pick for serious gamers. Perfect balance of power and design.', 449.99, 25, 'Acer', 'Monitor', '27 inch', '{\"Screen\": \"27\\\"\", \"Resolution\": \"2560x1440\", \"Panel\": \"IPS\", \"Refresh Rate\": \"144Hz\", \"G-Sync\": \"Yes\", \"VESA Mount\": \"Yes\"}', '[\"pictures/Monitor_AcerPredatorXB271HU.jpg\", \"pictures/Monitor_AcerPredatorXB271HU_2.jpg\", \"pictures/Monitor_AcerPredatorXB271HU_3.jpg\"]', 4.80, '2025-04-12 21:09:00'),
(15, 'Samsung Odyssey G7', 'Dive into immersion with the 32\" Samsung Odyssey G7, boasting a 1000R curved QHD screen, 240Hz refresh rate, and 1ms response. Packed with HDR600 and FreeSync/G-Sync support for unbeatable smoothness. A truly elite gaming display.', 599.99, 15, 'Samsung', 'Monitor', '32 inch', '{\"Screen\": \"32\\\" Curved\", \"Resolution\": \"QHD\", \"Refresh\": \"240Hz\", \"Response Time\": \"1ms\", \"Curvature\": \"1000R\", \"Panel\": \"VA\"}', '[\"pictures/Monitor_SamsungOdysseyG7.jpg\", \"pictures/Monitor_SamsungOdysseyG7_2.jpg\", \"pictures/Monitor_SamsungOdysseyG7_3.jpg\"]', 4.70, '2025-04-12 21:09:00'),
(16, 'Secretlab Titan Evo', 'The Titan Evo offers customizable lumbar support, memory foam pillows, and multi-tilt mechanisms. Its SoftWeave™ fabric and ergonomic design make it perfect for both work and play. Built to support posture and endurance.', 449.99, 30, 'Secretlab', 'Chair', 'Ergonomic', '{\"Material\": \"PU Leather\", \"Lumbar Support\": \"Adjustable\", \"Armrests\": \"4D\", \"Tilt\": \"Multi-Function\", \"Pillow\": \"Magnetic Memory Foam\"}', '[\"pictures/Chair_SecretlabTitanEvo.png\", \"pictures/Chair_SecretlabTitanEvo_2.png\", \"pictures/Chair_SecretlabTitanEvo_3.jpg\"]', 4.90, '2025-04-12 21:09:00'),
(17, 'DXRacer Formula', 'The DXRacer Formula Series is a high-back gaming chair with breathable material, ergonomic curves, and adjustable 3D armrests. Designed to enhance focus and comfort during extended play. Trusted by streamers and pros worldwide.', 299.99, 40, 'DXRacer', 'Chair', 'Standard', '{\"Type\": \"Racing Chair\", \"Lumbar Cushion\": \"Yes\", \"Color\": \"Black/Red\", \"Tilt Range\": \"90–135°\", \"Frame\": \"Steel\", \"Base\": \"Nylon\"}', '[\"pictures/Chair_DXRacerFormula.jpg\", \"pictures/Chair_DXRacerFormula_2.jpg\", \"pictures/Chair_DXRacerFormula_3.jpg\"]', 4.60, '2025-04-12 21:09:00'),
(18, 'Noblechairs Hero', 'Crafted with real leather and cold foam padding, the Hero Series offers luxurious comfort and advanced lumbar adjustment. A premium choice for gamers and professionals who value support, aesthetics, and quality build.', 599.99, 20, 'Noblechairs', 'Chair', 'Premium', '{\"Upholstery\": \"Real Leather\", \"Foam\": \"Cold-Cure\", \"Recline\": \"135°\", \"Armrests\": \"4D\", \"Frame\": \"Steel\", \"Base\": \"Aluminum\"}', '[\"pictures/Chair_NoblechairsHero.jpg\", \"pictures/Chair_NoblechairsHero_2.jpg\", \"pictures/Chair_NoblechairsHero_3.jpg\"]', 4.80, '2025-04-12 21:09:00'),
(19, 'NVIDIA RTX 4070 Ti', 'The RTX 4070 Ti delivers cutting-edge performance with 12GB GDDR6X, DLSS 3, and next-gen ray tracing. Built on Ada Lovelace architecture, it\'s ready for 4K gaming and demanding creative workflows. Future-proof your setup.', 899.99, 10, 'NVIDIA', 'Graphics Card', 'High-End', '{\"Architecture\": \"Ada Lovelace\", \"VRAM\": \"12GB GDDR6X\", \"Ray Tracing\": \"Yes\", \"DLSS\": \"3\", \"Ports\": \"HDMI 2.1, DP 1.4a\", \"TDP\": \"285W\"}', '[\"pictures/GraphicsCard_NVIDIA_RTX4070Ti.jpg\", \"pictures/GraphicsCard_NVIDIA_RTX4070Ti_2.jpg\", \"pictures/GraphicsCard_NVIDIA_RTX4070Ti_3.jpg\"]', 4.90, '2025-04-12 21:09:00'),
(20, 'AMD Radeon RX 7900 XT', 'AMD\'s RX 7900 XT brings 20GB GDDR6, RDNA 3 architecture, and advanced ray tracing for stunning visuals. It excels in high-resolution gaming and intensive rendering. Built for enthusiasts who demand raw power.', 849.99, 15, 'AMD', 'Graphics Card', 'High-End', '{\"Architecture\": \"RDNA 3\", \"VRAM\": \"20GB GDDR6\", \"Ray Tracing\": \"Yes\", \"Ports\": \"HDMI 2.1, DP 2.1\", \"TDP\": \"300W\", \"FSR\": \"Yes\"}', '[\"pictures/GraphicsCard_AMDRadeonRX7900XT.jpg\", \"pictures/GraphicsCard_AMDRadeonRX7900XT_2.jpg\", \"pictures/GraphicsCard_AMDRadeonRX7900XT_3.jpg\"]', 4.70, '2025-04-12 21:09:00'),
(21, 'MSI RTX 3060 Gaming X', 'The MSI RTX 3060 Gaming X offers 12GB VRAM, dual-fan cooling, and solid 1080p/1440p performance. It\'s the ideal entry-point for ray tracing and DLSS 2.0. Quiet, efficient, and VR-ready.', 399.99, 35, 'MSI', 'Graphics Card', 'Mid-Range', '{\"VRAM\": \"12GB GDDR6\", \"Cooling\": \"Dual Fan\", \"Boost Clock\": \"1807 MHz\", \"DLSS\": \"Yes\", \"Ray Tracing\": \"Yes\", \"TDP\": \"170W\"}', '[\"pictures/GraphicsCard_MSI_RTX3060GamingX.jpg\", \"pictures/GraphicsCard_MSI_RTX3060GamingX_2.jpg\", \"pictures/GraphicsCard_MSI_RTX3060GamingX_3.jpg\"]', 4.50, '2025-04-12 21:09:00'),
(23, 'PlayStation 5', 'The PlayStation 5 delivers lightning‑fast loading with its custom SSD, stunning 4K visuals, and immersive haptic feedback—redefining next‑gen gaming.', 499.99, 75, 'Sony', 'Console', 'Home Console', '{\"CPU\":\"8× AMD Zen 2 cores @ 3.5 GHz\",\"GPU\":\"Custom RDNA 2 GPU, 10.28 TFLOPS\",\"RAM\":\"16 GB GDDR6\",\"Storage\":\"825 GB Custom NVMe SSD\",\"Expandable Storage\":\"Supports NVMe SSD expansion\",\"Optical Drive\":\"4K UHD Blu‑ray\",\"Max Resolution\":\"8K\"}', '[\"pictures/img_6804080b9a6337.23031134.jpg\",\"pictures/img_6804080b9a9c01.62083921.jpg\",\"pictures/img_6804080b9acf16.89083462.jpg\"]', 4.85, '2025-04-19 14:42:53');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` float NOT NULL CHECK (`rating` >= 0 and `rating` <= 5),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` enum('admin','user') DEFAULT 'user',
  `address` varchar(255) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `salutation` varchar(10) DEFAULT NULL,
  `remember_token` varchar(255) DEFAULT NULL,
  `is_active` enum('false','true') NOT NULL DEFAULT 'true'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `email`, `username`, `password`, `created_at`, `role`, `address`, `zip_code`, `city`, `country`, `salutation`, `remember_token`, `is_active`) VALUES
(1, 'Manpreet', 'Misson', 'wi23b122@technikum-wien.at', 'wi23b122', '$2y$10$vzakoxssTey6HGuUuFebzuwczlWkrwxouDb00ukuhI6dKTRntsCW2', '2025-04-11 18:44:57', 'admin', 'Höchstädtplatz 6', '1200', 'Vienna', 'Austria', 'Mr', NULL, 'true'),
(2, 'Felix', 'Dallinger', 'wi23b007@technikum-wien.at', 'wi23b007', '$2y$10$9c60hINrri18QRwi.8j23uG5aUfHK9ffogp4uHJjgYKKkpomedSJ2', '2025-04-11 19:23:15', 'user', 'Höchstädtplatz 6', '1200', 'Vienna', 'Austria', 'Mr', NULL, 'true'),
(3, 'Timothy', 'Gregorian', 'wi23b027@technikum-wien.at', 'wi23b027', '$2y$10$xHC/LY4bjQ3wvT2drUg7TuJUbTMvNI82EJeRQmEuNNnNlHepYrcU6', '2025-04-12 15:58:30', 'user', 'Höchstädtplatz 6', '1200', 'Vienna', 'Austria', 'Mr', NULL, 'true'),
(4, 'Philip', 'Zeisler', 'wi23b107@technikum-wien.at', 'wi23b107', '$2y$10$MlujnEmWYt46IwkcSXIFZO9FBnoMFjsdVBKMV1vbYsMpJ6z4lrf4m', '2025-04-12 16:12:26', 'user', 'Höchstädtplatz 6', '1200', 'Vienna', 'Austria', 'Mr', NULL, 'true');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `vouchers`
--

CREATE TABLE `vouchers` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `remaining_value` decimal(10,2) NOT NULL,
  `is_active` enum('false','true') NOT NULL DEFAULT 'true',
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `vouchers`
--

INSERT INTO `vouchers` (`id`, `code`, `value`, `remaining_value`, `is_active`, `expires_at`, `created_at`) VALUES
(1, 'GHWELCOME10', 10.00, 10.00, 'false', '2025-12-31 00:00:00', '2025-04-15 20:22:23');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cart_user` (`user_id`),
  ADD KEY `fk_cart_product` (`product_id`);

--
-- Indizes für die Tabelle `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `payment_id` (`payment_id`),
  ADD KEY `voucher_id` (`voucher_id`);

--
-- Indizes für die Tabelle `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indizes für die Tabelle `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indizes für die Tabelle `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indizes für die Tabelle `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT für Tabelle `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT für Tabelle `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT für Tabelle `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT für Tabelle `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT für Tabelle `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT für Tabelle `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`);

--
-- Constraints der Tabelle `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints der Tabelle `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
