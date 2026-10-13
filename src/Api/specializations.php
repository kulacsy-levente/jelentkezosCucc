<?php
header('Content-Type:application/json');
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../Controllers/specializationsController.php';

if ($_SERVER['REQUEST_METHOD'] == "GET") {
    $cont = new SpecializationsController();
    $ret = $cont->getAllSpec();
    if (is_array($ret)) {
        http_response_code(200);
        echo json_encode($ret);
    }
    else {
        http_response_code(401);
        echo '{"success": false }';
    }
}
else {
    http_response_code(405);
}