SET NAMES utf8mb4;

-- Jelenlegi kínálat (technikum: 5 év, szakképző iskola: 3 év)
INSERT INTO specializations (specName, years) VALUES
-- Csepreg – technikum
('Szoftverfejlesztő és -tesztelő', 5),
('Pénzügyi-számviteli ügyintéző', 5),
('Mechatronikai technikus', 5),
-- Csepreg – szakképző iskola
('CNC-programozó', 3),
('Szerszám- és készülékgyártó', 3),
('Mechatronikus karbantartó', 3),
-- Bük – szakképző iskola
('Pincér - vendégtéri szakember', 3),
('Szakács', 3),
('Cukrász', 3),
('Turisztikai technikus (szállodaszervező)', 5);
