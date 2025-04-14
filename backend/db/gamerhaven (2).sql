-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 13. Apr 2025 um 10:31
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
(11, 4, 'Credit Card', '2222222222222', '213', NULL, NULL, NULL, NULL, '2025-04-12 18:12:26');

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
  `attributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attributes`)),
  `image_url` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT NULL CHECK (`rating` between 0 and 5),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `brand`, `category`, `sub_category`, `attributes`, `image_url`, `rating`, `created_at`) VALUES
(1, 'Razer Viper Ultimate', 'Wireless RGB gaming mouse with 20K DPI sensor.', 129.99, 50, 'Razer', 'Mouse', 'Wireless', '{\"DPI\": \"20000\", \"RGB\": \"Yes\"}', '[\"pictures/Mouse_RazerViperUltimate.jpg\", \"pictures/Mouse_RazerViperUltimate_2.jpg\"]', 4.80, '2025-04-12 21:09:00'),
(2, 'Logitech G502 Hero', 'Wired gaming mouse with customizable weights.', 79.99, 60, 'Logitech', 'Mouse', 'Wired', '{\"DPI\": \"16000\", \"Weights\": \"Yes\"}', '[\"pictures/Mouse_LogitechG502Hero.jpg\", \"pictures/Mouse_LogitechG502Hero_2.jpg\"]', 4.70, '2025-04-12 21:09:00'),
(3, 'SteelSeries Rival 600', 'Dual sensor mouse with split-trigger buttons.', 89.99, 45, 'SteelSeries', 'Mouse', 'Wired', '{\"DPI\": \"12000\", \"RGB\": \"Yes\"}', '[\"pictures/Mouse_SteelSeriesRival600.jpg\", \"pictures/Mouse_SteelSeriesRival600_2.jpg\"]', 4.60, '2025-04-12 21:09:00'),
(4, 'Corsair K95 RGB', 'Mechanical gaming keyboard with macro keys.', 199.99, 60, 'Corsair', 'Keyboard', 'Mechanical', '{\"Switches\": \"Cherry MX\", \"RGB\": \"Yes\"}', '[\"pictures/Keyboard_CorsairK95RGB.jpg\", \"pictures/Keyboard_CorsairK95RGB_2.jpg\"]', 4.90, '2025-04-12 21:09:00'),
(5, 'Razer BlackWidow V3', 'Mechanical switches with RGB and media controls.', 129.99, 70, 'Razer', 'Keyboard', 'Mechanical', '{\"Switches\": \"Green\", \"RGB\": \"Yes\"}', '[\"pictures/Keyboard_RazerBlackWidowV3.jpg\", \"pictures/Keyboard_RazerBlackWidowV3_2.jpg\"]', 4.70, '2025-04-12 21:09:00'),
(6, 'SteelSeries Apex 5', 'Hybrid mechanical gaming keyboard.', 109.99, 85, 'SteelSeries', 'Keyboard', 'Hybrid', '{\"Switches\": \"Hybrid\", \"RGB\": \"Yes\"}', '[\"pictures/Keyboard_SteelSeriesApex5.jpg\", \"pictures/Keyboard_SteelSeriesApex5_2.jpg\"]', 4.60, '2025-04-12 21:09:00'),
(7, 'HyperX Cloud II', 'Surround sound gaming headset with mic.', 99.99, 40, 'HyperX', 'Headset', 'Wired', '{\"Surround\": \"7.1\", \"Mic\": \"Yes\"}', '[\"pictures/Headset_HyperXCloudII.jpg\", \"pictures/Headset_HyperXCloudII_2.jpg\"]', 4.80, '2025-04-12 21:09:00'),
(8, 'Logitech G Pro X', 'Pro-grade wired gaming headset with BLUE mic.', 119.99, 55, 'Logitech', 'Headset', 'Wired', '{\"Mic\": \"BLUE Voice\", \"Surround\": \"DTS\"}', '[\"pictures/Headset_LogitechGProX.jpg\", \"pictures/Headset_LogitechGProX_2.jpg\"]', 4.70, '2025-04-12 21:09:00'),
(9, 'SteelSeries Arctis 7', 'Wireless gaming headset with 24h battery.', 159.99, 35, 'SteelSeries', 'Headset', 'Wireless', '{\"Battery\": \"24h\", \"Mic\": \"Retractable\"}', '[\"pictures/Headset_SteelSeriesArctis7.png\", \"pictures/Headset_SteelSeriesArctis7_2.png\"]', 4.60, '2025-04-12 21:09:00'),
(10, 'Xbox Wireless Controller', 'Official Xbox Series X controller.', 59.99, 90, 'Microsoft', 'Controller', 'Wireless', '{\"Platform\": \"Xbox/PC\", \"Color\": \"Black\"}', '[\"pictures/Controller_XboxWirelessController.jpg\", \"pictures/Controller_XboxWirelessController_2.jpg\"]', 4.50, '2025-04-12 21:09:00'),
(11, 'PlayStation DualSense', 'Next-gen PS5 controller with haptics.', 69.99, 80, 'Sony', 'Controller', 'Wireless', '{\"Platform\": \"PS5/PC\", \"Haptics\": \"Yes\"}', '[\"pictures/Controller_PlayStationDualSense.jpg\", \"pictures/Controller_PlayStationDualSense_2.jpg\"]', 4.80, '2025-04-12 21:09:00'),
(12, '8BitDo SN30 Pro', 'Retro-style wireless controller for PC & Switch.', 49.99, 40, '8BitDo', 'Controller', 'Wireless', '{\"Platform\": \"PC/Switch\", \"Retro\": \"Yes\"}', '[\"pictures/Controller_8BitDoSN30Pro.jpeg\", \"pictures/Controller_8BitDoSN30Pro_2.jpeg\"]', 4.40, '2025-04-12 21:09:00'),
(13, 'ASUS ROG Swift PG279Q', '27\" 1440p 165Hz G-Sync gaming monitor.', 499.99, 20, 'ASUS', 'Monitor', '27 inch', '{\"Resolution\": \"2560x1440\", \"Hz\": \"165\"}', '[\"pictures/Monitor_ASUSROGSwiftPG279Q.jpg\", \"pictures/Monitor_ASUSROGSwiftPG279Q_2.jpg\"]', 4.90, '2025-04-12 21:09:00'),
(14, 'Acer Predator XB271HU', '27\" IPS 144Hz monitor with G-Sync.', 449.99, 25, 'Acer', 'Monitor', '27 inch', '{\"Resolution\": \"2560x1440\", \"Hz\": \"144\"}', '[\"pictures/Monitor_AcerPredatorXB271HU.jpg\", \"pictures/Monitor_AcerPredatorXB271HU_2.jpg\"]', 4.80, '2025-04-12 21:09:00'),
(15, 'Samsung Odyssey G7', '32\" curved QHD monitor 240Hz.', 599.99, 15, 'Samsung', 'Monitor', '32 inch', '{\"Resolution\": \"2560x1440\", \"Hz\": \"240\"}', '[\"pictures/Monitor_SamsungOdysseyG7.jpeg\", \"pictures/Monitor_SamsungOdysseyG7_2.jpeg\"]', 4.70, '2025-04-12 21:09:00'),
(16, 'Secretlab Titan Evo', 'Ergonomic gaming chair with memory foam.', 449.99, 30, 'Secretlab', 'Chair', 'Ergonomic', '{\"Material\": \"PU Leather\", \"Adjustable\": \"Yes\"}', '[\"pictures/Chair_SecretlabTitanEvo.png\", \"pictures/Chair_SecretlabTitanEvo_2.png\"]', 4.90, '2025-04-12 21:09:00'),
(17, 'DXRacer Formula', 'High back gaming chair with lumbar support.', 299.99, 40, 'DXRacer', 'Chair', 'Standard', '{\"Lumbar\": \"Yes\", \"Color\": \"Black/Red\"}', '[\"pictures/Chair_DXRacerFormula.jpg\", \"pictures/Chair_DXRacerFormula_2.jpg\"]', 4.60, '2025-04-12 21:09:00'),
(18, 'Noblechairs Hero', 'Premium gaming chair with real leather.', 599.99, 20, 'Noblechairs', 'Chair', 'Premium', '{\"Material\": \"Real Leather\", \"Recline\": \"135°\"}', '[\"pictures/Chair_NoblechairsHero.jpg\", \"pictures/Chair_NoblechairsHero_2.jpg\"]', 4.80, '2025-04-12 21:09:00'),
(19, 'NVIDIA RTX 4070 Ti', 'High-end GPU with DLSS 3 support.', 899.99, 10, 'NVIDIA', 'Graphics Card', 'High-End', '{\"VRAM\": \"12GB\", \"DLSS\": \"3\"}', '[\"pictures/GraphicsCard_NVIDIA_RTX4070Ti.jpg\", \"pictures/GraphicsCard_NVIDIA_RTX4070Ti_2.jpg\"]', 4.90, '2025-04-12 21:09:00'),
(20, 'AMD Radeon RX 7900 XT', 'Powerful gaming card with ray tracing.', 849.99, 15, 'AMD', 'Graphics Card', 'High-End', '{\"VRAM\": \"20GB\", \"RayTracing\": \"Yes\"}', '[\"pictures/GraphicsCard_AMDRadeonRX7900XT.jpg\", \"pictures/GraphicsCard_AMDRadeonRX7900XT_2.jpg\"]', 4.70, '2025-04-12 21:09:00'),
(21, 'MSI RTX 3060 Gaming X', 'Mid-range card for 1080p/1440p gaming.', 399.99, 35, 'MSI', 'Graphics Card', 'Mid-Range', '{\"VRAM\": \"12GB\", \"Cooling\": \"Dual Fan\"}', '[\"pictures/GraphicsCard_MSI_RTX3060GamingX.jpg\", \"pictures/GraphicsCard_MSI_RTX3060GamingX_2.jpg\"]', 4.50, '2025-04-12 21:09:00');

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
  `remember_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `email`, `username`, `password`, `created_at`, `role`, `address`, `zip_code`, `city`, `country`, `salutation`, `remember_token`) VALUES
(1, 'Manpreet', 'Misson', 'wi23b122@technikum-wien.at', 'wi23b122', '$2y$10$vzakoxssTey6HGuUuFebzuwczlWkrwxouDb00ukuhI6dKTRntsCW2', '2025-04-11 18:44:57', 'admin', 'Höchstädtplatz 6', '1200', 'Vienna', 'Austria', 'Mr', NULL),
(2, 'Felix', 'Dallinger', 'wi23b007@technikum-wien.at', 'wi23b007', '$2y$10$xBHLl.7jxnPvFNgK8MvxK.tdOd/VJU6Z3t1ZaPLBSViTnubmGIsJe', '2025-04-11 19:23:15', 'user', 'Höchstädtplatz 6', '1200', 'Vienna', 'Austria', 'Mr', NULL),
(3, 'Timothy', 'Gregorian', 'wi23b027@technikum-wien.at', 'wi23b027', '$2y$10$xHC/LY4bjQ3wvT2drUg7TuJUbTMvNI82EJeRQmEuNNnNlHepYrcU6', '2025-04-12 15:58:30', 'user', 'Höchstädtplatz 6', '1200', 'Vienna', 'Austria', 'Mr', NULL),
(4, 'Philip', 'Zeisler', 'wi23b107@technikum-wien.at', 'wi23b107', '$2y$10$MlujnEmWYt46IwkcSXIFZO9FBnoMFjsdVBKMV1vbYsMpJ6z4lrf4m', '2025-04-12 16:12:26', 'user', 'Höchstädtplatz 6', '1200', 'Vienna', 'Austria', 'Mr', NULL);

--
-- Indizes der exportierten Tabellen
--

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
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT für Tabelle `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
