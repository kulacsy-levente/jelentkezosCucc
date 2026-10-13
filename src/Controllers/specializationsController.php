<?php
require __DIR__."/../Models/Specialization.php";
class SpecializationsController {
    private DB $DB;
    public function __construct()
    {
        $this->DB = new DB();
    }
    function getAllSpec() : array {
        $sql = "SELECT * FROM specializations";
        $result = $this->DB->conn->query($sql);
        $return = [];
        while ($row = $result->fetch_assoc()) {
            $return[] = new Specialization($row["id"], $row["specName"], $row["years"]);
        }
        return $return;
    }
}