-- La plateforme européenne de règlement en ligne des litiges (ODR) a fermé le 20 juillet 2025 :
-- on retire la phrase qui y renvoie dans les conditions de vente enregistrées par l'administrateur.
UPDATE `settings` SET `value` = REPLACE(`value`, ' Il peut aussi utiliser la plateforme européenne de règlement des litiges : https://ec.europa.eu/consumers/odr.', '') WHERE `key` = 'service_info';
