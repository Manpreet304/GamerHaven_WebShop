-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 10. Apr 2025 um 12:37
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
  `payment_method` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` enum('admin','user') DEFAULT 'user',
  `address` varchar(255) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `payment_information` text DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `salutation` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `email`, `username`, `password`, `payment_method`, `created_at`, `role`, `address`, `zip_code`, `city`, `payment_information`, `country`, `salutation`) VALUES
(1, 'Manpreet', 'Misson', 'wi23b122@technikum-wien.at', 'wi23b122', 'dein_gehashtes_passwort', NULL, '2025-03-13 13:53:47', 'admin', 'Hauptstraße 1', '1010', 'Wien', 'Kreditkarte - XXXX-XXXX-XXXX-1234', 'India', NULL),
(2, 'Sebastian', 'Ecker', 'wi23b134@technikum-wien.at', 'wi23b134', 'dein_gehashtes_passwort', NULL, '2025-03-13 13:55:20', 'admin', 'Nebenstraße 5', '4020', 'Linz', 'PayPal - sebastian@example.com', 'Catalonia', NULL),
(3, 'Felix', 'Dallinger', 'wi23b007@technikum-wien.at', 'wi23b007', 'dein_gehashtes_passwort', NULL, '2025-03-13 13:55:20', 'admin', 'Marktplatz 8', '5020', 'Salzburg', 'Kreditkarte - XXXX-XXXX-XXXX-5678', 'Azerbaijan', NULL),
(4, 'Philip', 'Zeisler', 'wi23b107@technikum-wien.at', 'philipzeisler', '$2y$10$g1s/yLdBl.YKomN2HfwO4.1jUyoNRjLku4fcvnjbkoJSJU225Hp7O', 'Credit Card', '2025-04-09 22:39:41', '', 'Höchstädtplatz 6', '1200', 'Vienna', '1234567897654321', 'Austria', 'Mr');

--
-- Indizes der exportierten Tabellen
--

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
-- AUTO_INCREMENT für Tabelle `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
