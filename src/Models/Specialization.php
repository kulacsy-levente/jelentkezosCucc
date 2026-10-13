<?php
class Specialization {
    public int $id;
    public string $specName;
    public int $years;
    public function __construct($id, $specName, $years)
    {
        $this->id = $id;
        $this->specName = $specName;
        $this->years = $years;
    }
}