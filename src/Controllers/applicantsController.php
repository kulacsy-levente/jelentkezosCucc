<?php
require_once __DIR__."/../Models/Applicant.php";
require_once __DIR__."/../Models/Specialization.php";
class ApplicantsController {
    private DB $DB;
    public function __construct()
    {
        $this->DB = new DB();
    }
    function getAll() : array {
        $sql = "SELECT specApps.appId, specializations.id, specializations.specName, specializations.years
                FROM specApps
                INNER JOIN specializations ON specializations.id = specApps.specId
                ORDER BY specializations.specName";
        $result = $this->DB->conn->query($sql);
        $specsByApp = [];
        while ($row = $result->fetch_assoc()) {
            $specsByApp[$row["appId"]][] = new Specialization($row["id"], $row["specName"], $row["years"]);
        }

        $sql = "SELECT * FROM applicants ORDER BY createdAt DESC, id DESC";
        $result = $this->DB->conn->query($sql);
        $return = [];
        while ($row = $result->fetch_assoc()) {
            $return[] = new Applicant(
                $row["id"],
                $row["fullname"],
                $row["school"],
                $row["isDorm"],
                $row["isLastYear"],
                $row["createdAt"],
                $specsByApp[$row["id"]] ?? []
            );
        }
        return $return;
    }
    function validate(array $data) : ?string {
        $fullname = trim($data["fullname"] ?? "");
        $school = trim($data["school"] ?? "");
        $specIds = $data["specIds"] ?? [];

        if ($fullname == "" || mb_strlen($fullname) > 255) {
            return "Kérjük, add meg a teljes neved.";
        }
        if ($school == "" || mb_strlen($school) > 255) {
            return "Kérjük, add meg, melyik iskolából érkezel.";
        }
        if (!is_array($specIds) || count($specIds) == 0) {
            return "Válassz legalább egy szakot.";
        }
        foreach ($specIds as $specId) {
            if (!is_numeric($specId)) {
                return "Hibás szak lett kiválasztva.";
            }
        }
        if (!isset($data["isDorm"]) || !is_bool($data["isDorm"])) {
            return "Add meg, hogy kollégista vagy bejárós lennél.";
        }
        if (!isset($data["isLastYear"]) || !is_bool($data["isLastYear"])) {
            return "Add meg, hogy végzős vagy-e.";
        }
        return null;
    }
    function create(string $fullname, string $school, array $specIds, bool $isDorm, bool $isLastYear) : ?int {
        $conn = $this->DB->conn;
        $conn->begin_transaction();
        try {
            $sql = "INSERT INTO applicants (fullname, school, isDorm, isLastYear) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $dorm = $isDorm ? 1 : 0;
            $lastYear = $isLastYear ? 1 : 0;
            $stmt->bind_param("ssii", $fullname, $school, $dorm, $lastYear);
            $stmt->execute();
            $appId = $conn->insert_id;

            $sql = "INSERT INTO specApps (appId, specId) VALUES (?, ?)";
            $stmt = $conn->prepare($sql);
            foreach (array_unique(array_map("intval", $specIds)) as $specId) {
                $stmt->bind_param("ii", $appId, $specId);
                $stmt->execute();
            }

            $conn->commit();
            return $appId;
        } catch (\Throwable $th) {
            $conn->rollback();
            return null;
        }
    }
    function delete(int $id) : bool {
        $sql = "DELETE FROM applicants WHERE id = ?";
        $stmt = $this->DB->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->affected_rows > 0;
    }
}
