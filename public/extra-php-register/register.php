<?php
	session_start();
    $db=new mysqli("localhost","root","","qtaskers");
    $name=$_POST["fullname"];
    $email=$_POST["email"];
    $phone=$_POST['phonenumber'];
    $pass=$_POST["password"];
    $add=$_POST["address"];
    
    $n=$db->query("select phone,email from customer where email='$email' or phone='$phone'");
    if(mysqli_num_rows($n)>0)
    {	
        header("location:index.php?x='Username or Email already exists'");
    }
    else
   	{
        if(preg_match('/[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+.[a-zA-Z]{2,4}/', $email)&&preg_match('/[A-Za-z ]{2,}/', $name)&&preg_match("#.*^(?=.{8,20})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$#",$pass)&&preg_match('/[A-Za-z0-9]{5,}/', $add))
        {
          date_default_timezone_set('asia/calcutta');
		      require_once('class.phpmailer.php');
		      $mail = new PHPMailer();
		      $body = "Welcome To Qtaskers, book a home service now.!!";
		      $mail->IsSMTP();
		      $mail->SMTPAuth   = true;                  
		      $mail->SMTPSecure = "ssl";                 
		      $mail->Host       = "smtp.gmail.com";      
		      $mail->Port       = 465;                   
		      $mail->Username   = "amanpreetsingh8855@gmail.com"; 
		      $mail->Password   = "Aman@8855";      
		      $mail->SetFrom($_POST["u"], 'Amanpreet Singh Bhasin');
		      $mail->Subject= "Welcome";
		      $mail->MsgHTML($body);
		      $mail->AddAddress($email, "info");
		      if(!$mail->Send()) 
		      {
            header("location:register.php?x='This is not a valid mail id'");
          }  	
          else
          {
   			    $db->query("insert into customer values('$email','$name','$phone','$addr','$pass')");
   			    $_SESSION['logged_in']=$name;
       	    $_SESSION['username']=$email;
   		 	   header("location:../index.php");
          }
        }
        else{
            header("location:index.php?x='wrong format'");
        }
   	}	
?>
