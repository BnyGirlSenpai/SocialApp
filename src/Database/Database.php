<?php
//Globals
$validated = false;

class Database
{
    private $db_host ;
    private $db_user ;
    private $db_pass ;
    private $db_name ;
    private $conn = null;

    /**
     * @param $db_host
     * @param $db_user
     * @param $db_pass
     * @param $db_name
     */

    public function __construct($db_host, $db_user, $db_pass, $db_name){
        $this->db_host = $db_host;
        $this->db_user = $db_user;
        $this->db_pass = $db_pass;
        $this->db_name = $db_name;
    }
    /**
     * @return bool
     */

    public function connect(): bool
    {
        if (!$this->conn) {
            $this->conn = mysqli_connect($this->db_host, $this->db_user, $this->db_pass);
            if ($this->conn) {
                $seldb = mysqli_select_db($this->conn, $this->db_name);
                if ($seldb) {
                    echo 'Conncted to Db'
                    return true;
                } else {
                    echo 'Connection failed';
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return true;
        }
    }
    /**
     * @return bool|void
     */

    public function disconnect(){
        if ($this->conn) {
            if (mysqli_close($this->conn)) {
                $this->conn = false;
                return true;
            } else {
                return false;
            }
        }
    }
    /*
    private function tableExists($table): bool|string
    {
        $tablesInDb = mysqli_query($this->conn, 'SHOW TABLES FROM ' . $this->db_name . ' LIKE "' . $table . '"');
        if ($tablesInDb) {
            if (mysqli_num_rows($tablesInDb) == 1) {
                return true;
            } else {
                return false;
            }
        }
        return "Db checken";
    }

    public function insert_User($table, $username, $email, $password): bool
    {
        // Assuming $username, $email, and $password are the values from the form
        $insert = 'INSERT INTO `' . $table . '` (username, email, password) VALUES (';
        $insert .= "'" . $this->conn->escape_string($username) . "', ";
        $insert .= "'" . $this->conn->escape_string($email) . "', ";
        $insert .= "'" . $this->conn->escape_string($password) . "'";
        $insert .= ')';

        $result = mysqli_query($this->conn, $insert);

        if ($result) {
            return true;
        } else {
            // Include detailed error handling, e.g., log or return error message
            return false;
        }
    }

    public function user_Login($table,$username,$password){
        global $validated;
        global $Ausgabe;
        if ($this->tableExists($table)) {
            $sql = ("SELECT * FROM `$table` WHERE username = '$username'AND PASSWORD = '$password'");
            $check_user = $this->conn->prepare($sql);
            $check_user->execute();
            $check_user->store_result();
            $count = $check_user->num_rows;
            if ($count == 0) {
                $Ausgabe =  'user does not exist or pw wrong';
                return $validated = FALSE;
            }
            else {
                $Ausgabe =  'user exists and pw correct :) ';
                return $validated = TRUE;
            }
        }
        return $Ausgabe;
    }

    public function user_exists($table,$username,$email){
        global $validated;
        global $Ausgabe;
        if ($this->tableExists($table)) {
            $sql = ("SELECT * FROM `$table` WHERE username = '$username'AND email='$email'");
            $check_user = $this->conn->prepare($sql);
            $check_user->execute();
            $check_user->store_result();
            $count = $check_user->num_rows;
            if ($count >=1) {
                $Ausgabe =  'user already exists';
                $validated = FALSE;
            }
            else {
                $Ausgabe =  ' new User '. $username. ' registered ';
                $validated = TRUE;
            }
        }
        return $Ausgabe;
    }

    public function search_user($table, $searchText, $order = null): array
    {
        $results = [];

        // Using prepared statement to prevent SQL injection
        $sql = "SELECT * FROM `$table` WHERE username LIKE ? ";
        if ($order != null) {
            $sql .= ' ORDER BY ' . $order;
        }

        if ($this->tableExists($table)) {
            // Add '%' around the search term for the LIKE clause
            $searchText = '%' . $searchText . '%';

            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param('s', $searchText);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $results[] = $row;
                }
            }
            $stmt->close();
        }
        return $results;
    }*/
}




