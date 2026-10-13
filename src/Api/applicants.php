<?php
header('Content-Type:application/json');
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../Controllers/applicantsController.php';

if ($_SERVER['REQUEST_METHOD'] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!is_array($data)) {
        http_response_code(400);
        echo '{"success": false, "error": "Hibás kérés."}';
        exit;
    }
    $cont = new ApplicantsController();
    $error = $cont->validate($data);
    if ($error != null) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => $error], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $id = $cont->create(trim($data["fullname"]), trim($data["school"]), $data["specIds"], $data["isDorm"], $data["isLastYear"]);
    if ($id != null) {
        http_response_code(201);
        echo json_encode(["success" => true, "id" => $id]);
    }
    else {
        http_response_code(500);
        echo '{"success": false, "error": "Nem sikerült elmenteni a jelentkezést, próbáld újra!"}';
    }
}
else if ($_SERVER['REQUEST_METHOD'] == "GET") {
    requireAdmin();
    $cont = new ApplicantsController();
    http_response_code(200);
    echo json_encode($cont->getAll(), JSON_UNESCAPED_UNICODE);
}
else if ($_SERVER['REQUEST_METHOD'] == "DELETE") {
    requireAdmin();
    $id = (int)($_GET["id"] ?? 0);
    $cont = new ApplicantsController();
    if ($id > 0 && $cont->delete($id)) {
        http_response_code(200);
        echo '{"success": true }';
    }
    else {
        http_response_code(404);
        echo '{"success": false, "error": "Nincs ilyen jelentkezés."}';
    }
}
else {
    http_response_code(405);
}
