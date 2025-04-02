<?php
$host = "localhost";
$dbname = "gamerhaven";
$username = "root";
$password = "";

$conn = mysqli_connect($host, $username, $password, $dbname);

if(!$conn){
    die ("Connection error occurred!" . mysqli_connect_error());
}

echo "Verbindung erfolgreich!";

?>