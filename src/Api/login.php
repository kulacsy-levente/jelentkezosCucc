<?php
header('Content-Type:application/json');
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../Controllers/authController.php';

if ($_SERVER['REQUEST_METHOD'] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data["password"]) || !is_string($data["password"])) {
        http_response_code(401);
        echo '{"success": false }';
        exit;
    }
    $cont = new AuthController();
    if ($cont->login($data["password"])) {
        http_response_code(200);
        $_SESSION["admin"] = true;
        echo '{"success": true }';
    }
    else {
        http_response_code(401);
        echo '{"success": false }';
    }
}
else {
    http_response_code(405);
}