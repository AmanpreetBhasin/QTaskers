<?php
	session_start();
    $db=new mysqli("localhost","root","","qtaskers");
    $pass=$_POST["Password"];
    $username=$_POST["Email_Id"];
    $n=$db->query("select name,email from customer where email='$username' and password='$pass'");
    if(mysqli_num_rows($n)>0)
    {	
      $name=mysqli_fetch_assoc($n);
      $_SESSION['logged_in']=$name[name];
      $_SESSION['username']=$name[email];
      header("location:../index.php");
    }
    else
   	{
   		echo "Invalid Usename and password";
   	}	
?>
