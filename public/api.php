<?php
$endpoint = $_GET['endpoint'] ?? '';
unset($_GET['endpoint']);

$file = __DIR__ . '/../src/Api/' . $endpoint . '.php';

if (!preg_match('/^[A-Za-z0-9_-]+$/', $endpoint) || !is_file($file)) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Nincs ilyen végpont.'], JSON_UNESCAPED_UNICODE);
    exit;
}

require $file;
