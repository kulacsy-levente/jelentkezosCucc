<?php
header('Content-Type:application/json');
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../Controllers/authController.php';

if ($_SERVER['REQUEST_METHOD'] == "POST") {
    $cont = new AuthController();
    if ($cont->logout()) {
        http_response_code(200);
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