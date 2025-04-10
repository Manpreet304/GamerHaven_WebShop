-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 10. Apr 2025 um 16:18
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
(1, 1, 'Credit Card', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-10 14:13:44'),
(2, 2, 'Bank Transfer', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-10 15:24:10'),
(3, 3, 'Credit Card', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-10 16:16:07');

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
(1, 'Gaming Maus', 'Kabellose Maus mit RGB-Beleuchtung und 16000 DPI', 79.99, 50, 'Razer', 'Maus', 'Wireless', '{ \"DPI\": \"16000\", \"RGB\": \"Ja\" }', 'https://example.com/maus1.jpg', 4.50, '2025-03-13 14:36:27');

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
  `salutation` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `email`, `username`, `password`, `created_at`, `role`, `address`, `zip_code`, `city`, `country`, `salutation`) VALUES
(1, 'Manpreet', 'Misson', 'wi23b122@technikum-wien.at', 'wi23b122', '$2y$10$M.tRaSt6bvtYHrCVcPSZQOnaKFGc4G4KjO7OI0tjxzZGiGWiE7QuS', '2025-04-10 12:13:44', 'user', 'Höchstädtplatz 6', '1200', 'Vienna', 'Austria', 'Mr'),
(2, 'Philip', 'Zeisler', 'wi23b107@technikum-wien.at', 'wi23b107', '$2y$10$8ZAoHFZCD5pRM.AUvBSUQe4.qrTfWRl6ySDgb8InyIIAIdJK7j6JW', '2025-04-10 13:24:10', 'user', 'Höchstädtplatz 6', '1200', 'Vienna', 'Austria', 'Mr'),
(3, 'Timothy', 'Gregorian', 'wi23b027@technikum-wien.at', 'wi23b027', '$2y$10$RY85cKejeGqMisU6AEftJOYIpSANph2tQeieD.lXmz6NoKlYU/SBq', '2025-04-10 14:16:07', 'user', 'Höchstädtplatz 6', '1200', 'Vienna', 'Austria', 'Mr');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT für Tabelle `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
