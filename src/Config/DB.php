<?php
class DB {
    private string $server;
    private int $port;
    private string $username;
    private string $password;
    private string $dbname;
    public mysqli $conn;
    public function __construct()
    {
        $conf = new Config();
        $this->server = $conf->DBserver;
        $this->port = $conf->DBport;
        $this->username = $conf->DBusername;
        $this->password = $conf->DBpassword;
        $this->dbname = $conf->DBname;
        $this->connect();
    }
    private function connect() : void {
        try {
            $this->conn = new mysqli($this->server, $this->username, $this->password, $this->dbname, $this->port);
            $this->conn->set_charset("utf8mb4");
        } catch (\Throwable $th) {
            http_response_code(500);
            echo '{"success": false, "error": "Nem sikerült csatlakozni az adatbázishoz."}';
            exit;
        }
    }
}
