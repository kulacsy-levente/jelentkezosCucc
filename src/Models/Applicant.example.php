<?php
class Applicant {
    public int $id;
    public string $fullname;
    public string $school;
    public bool $isDorm;
    public bool $isLastYear;
    public string $createdAt;
    // A frontend "specializations" néven várja (Specialization objektumok tömbje)
    public array $specializations;
    public function __construct($id, $fullname, $school, $isDorm, $isLastYear, $createdAt, $specializations = [])
    {
        $this->id = $id;
        $this->fullname = $fullname;
        $this->school = $school;
        $this->isDorm = $isDorm;
        $this->isLastYear = $isLastYear;
        $this->createdAt = $createdAt;
        $this->specializations = $specializations;
    }
}
