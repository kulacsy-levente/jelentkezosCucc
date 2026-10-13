<?php
class AuthController {
    private string $password;
    public function __construct()
    {
        $conf = new Config();
        $this->password = $conf->adminPW;
    }
    public function login(string $password) : bool {
        if ($password == $this->password) {
            return true;
        }
        else {
            return false;
        }
    }
    public function logout() : bool {
        unset($_SESSION["admin"]);
        session_destroy();
        return true;
    }
}