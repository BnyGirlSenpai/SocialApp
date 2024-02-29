<?php

require 'Database.php';

//Globals
global $validated;

//WebAppDatabase
$user = new UserDatabase('database','app','fiberline','app');
$user->connect();

/*
//Registration_Form
if ( isset($_POST['username']) && isset($_POST['email']) && isset($_POST['password'])) {
    if (isset($_POST['signin'])) {

        $username  = $_POST['username'];
        $email     = $_POST['email'];
        $password  = ($_POST['password']);

        $user->user_exists('users',$username,$email);
        if($validated) {
            echo 'Hat geklappt ' . $_POST['username'];
            $user->insert_User('users', $username,$email,$password);
            try {
                echo $twig->render('MainPage.html');
            }
            catch (LoaderError|SyntaxError|RuntimeError $e) {
            }
        }
        else{
            echo 'Du bist bereits registriert ' . $_POST['username'];
            try {
                echo $twig->render('SignInForm.html');
            }
            catch (LoaderError|RuntimeError|SyntaxError $e) {
            }
        }
    }
}

//Login-Form
if (isset($_POST['Login'])) {
    if (isset($_POST['username']) && isset($_POST['password'])) {
            $username = $_POST['username'];
            $password = ($_POST['password']);
            $user->user_Login('users', $username, $password);
            if($validated){
                try {
                    echo $twig->render('MainPage.html');
                }
                catch (LoaderError|RuntimeError|SyntaxError $e) {
                }
            }
        else{
            echo'Error :(';
            try {
                echo $twig->render('LogInForm.html');
            }
            catch (LoaderError|RuntimeError|SyntaxError $e) {
            }
        }
    }
}

//User-Search-Form
if(isset($_POST['searchText']) && isset($_POST['search'])){
    $searchText = $_POST['searchText'];
    $searchResults =  $user->search_user('users',$searchText);
    // Display search results
    if ($searchResults) {
        echo '<h2>Search Results</h2>';
        foreach ($searchResults as $result) {
            echo '<div>' . htmlspecialchars($result['username']) . '</div>';
        }
    }
    else
    {
        echo 'No User found!';
    }
} */

