<?php
session_start();
require __DIR__ . '/Config/config.php';
require __DIR__ . '/Config/DB.php';
header('Content-Type: application/json; charset=utf-8');

function respond($data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
function requireAdmin(): void {
    if (empty($_SESSION['admin'])) respond(['error' => 'Nincs bejelentkezve.'], 401);
}
