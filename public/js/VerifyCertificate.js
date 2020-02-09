<!DOCTYPE html>
<html lang="en">
<head>
<title>Generate Pdf  </title>
  <meta charset="utf-8">
  <link rel="shortcut icon" href="belfricslogo.PNG" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="http://lib.sinaapp.com/js/jquery/1.9.1/jquery-1.9.1.min.js"></script>
  <script src="http://localhost:9305/api/dapps/27566d2d1464d1ca9964662027c4ac317bf3d6fcd1f23dc97ecabd1975b8dd09/contract/certificate.js"></script>

  <link rel="stylesheet" href="homestyle.css" />
</head>


<body>

<nav class="navbar navbar-inverse">
  <div class="container-fluid">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>                        
      </button>
      <a class="navbar-brand" href="#" >BELFRICS CERTIFICATE DAPP</a>
    </div>
    <div class="collapse navbar-collapse" id="myNavbar">
<button type="button" class="btn btn-danger pull-right">Sign Out</button>
</div>
</nav>

</div><br>

<div class="container-fluid">
  <div class="col-md-12">
    <form>
      <div class="well clearfix">
       
        <div id="certficateVerify">


          <div class="wrapper">
                  <div class="profile" style="border:1px solid black;">
                    <br>
                    <div style="margin-left:30px">
                      <div class="row">
                        <div class="col-md-12"><img src="blankperson.png" width="25px" height="px"/> &nbsp;<span style="font-weight: bold" id="stname">Name</span></div>
                        <br>
                    <!-- <div class="col-md-11"> </div> -->
                  </div>
                  <div class="row">
                      <div id="trainername" class="col-md-12" style="text-align: center; font-size: 20px;font-weight: bolder">Name of Trainer</div>
                      <br>
                      <br>
                  <!-- <div class="col-md-11"> </div> -->
                </div>
                  </div>
                  <div id="certData">
                   <ul>
                     <li>Date of Course Completion: ret.DOI1</li>
                     <li>Issued to: ret.stu1</li>
                     <li>Issued by: ret.issuer1</li>
                     <li>Signed by: </li>
                     <li>Title: ret.course1</li>
                     <li>Verified: YES</li>
                     <li>Verification link: <a href="#">Verify</a></li>
                     <li>Blockchain Address:</li>
                   </ul>

                  </div>


                   <p style="font-size: 12px;font-weight: bold;margin-left: 30px;text-align: center"> This certificate is valid as of 18/10/2018. issuer of ACCESS used his public/ private key pair on the Belrium bloackchain to issue this certificate on 2 Oct 2018. This certificate was issued using Belfrics Smart Contract as Service Platform.</p>
                   <p style="font-size: 10px;margin-left: 30px;text-align: center"> Belfrics makes digital certificate fast and secure. We use smart contracts and blockchain techonology to create audit trails of all transaction.</p>
                  <br><br>

                  </div>
                  </div> 
                  
        <div class="form-group" style="text-align:center">
        
      </div>
      
    </form>
  </div>

  

  <script type="text/javascript">

    function ShowData() {
                 $.ajax({
              type: 'GET',
              url: BASE_URL + '/certificate/:enrollmentId',
              data: EID2,
              dataType: 'json',
              success: function(ret) {
                  console.log(ret);
                  if (!ret.success) {
                      alert('Error: ' + ret.error);
                      return;
                  }
                  alert("Success! " + ret.transactionId);
                  displaycertificate(ret);
                  console.log(ret);
                }
            });

            }


    function displaycertificate(ret){
//              args: JSON.stringify(date1,stu1,course1,issuer1,DOI1)
        // var tblRow = "<tr>" + "<td>" + ret.date1 + "</td>" +
        //    "<td>" + ret.stu1 + "</td>" + "<td>" + ret.course1 + "</td>" + "<td>" + ret.issuer1 + "</td>" + "</tr>"
        var dataJson = $parseJSON(ret);
        var data="<ul>" +
                     "<li>Date of Course Completion:" +  dataJson.completiondate + "</li>" +
                     "<li>Issued to: " +  dataJson.issueto + "</li>" +
                     "<li>Issued by:</li>" +
                     "<li>Signed by:</li>" +
                     "<li>Title:</li>" +
                     "<li>Verified:</li>" 
                     "<li>Verification link:</li>"
                     "<li>Blockchain Address:</li>"
                   "</ul>"
           $('#certData').html(data);
           $('#stname').html(dataJson.stname);
           $('#trainername').html(dataJson.trainername);
     }

    var DAPP_ID =  '27566d2d1464d1ca9964662027c4ac317bf3d6fcd1f23dc97ecabd1975b8dd09';
     //window.location.pathname.split('/')[2];
        console.log("DAPP_ID: "+DAPP_ID);
        var BASE_URL = 'http://localhost:9305/api/dapps/' + DAPP_ID;
    var EID2   = document.getElementById("txtEID").value;
    function Verify(ret){
      document.getElementById("Downloadbtn").disabled = false;
      console.log("came here");
        $.ajax({
              type: 'GET',
              url: BASE_URL + '/certificate/:enrollmentId',
              data: EID2,
              dataType: 'json',
              success: function(ret) {
                  console.log(ret);
                  
                  if (!ret.success) {
                      alert('Error: ' + ret.error);
                      return;
                  }
                  alert("Success! " + ret.stu1);
             //     Verify(ret);
                  console.log("ret : "+ret);
                }
            });         
     }

  </script>
 
<div class="container-fluid">
                
    <div class="col-md-6">
    <!-- <a href="#" target="_blank" class="btn btn-info btn-lg" onclick="HTMLtoPDF()">
      <span class="glyphicon glyphicon-download"></span> Download
    </a>

    <a href="#" target="_blank" class="btn btn-info btn-lg" onclick="ShowData()">
            <span class="glyphicon glyphicon-download"></span> View
          </a>

    <a href="#" target="_blank" class="btn btn-info btn-lg" onclick="Verify()">
                <span class="glyphicon glyphicon-download"></span> Verify
              </a>
 -->
  <!-- <a href="#" onclick="HTMLtoPDF()">Download PDF</a> -->




 </div>
</div>
  </div>

<!--   
  <div class="wrapper">
        <div class="profile">
           <table id= "userdata">
          <thead>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email Address</th>
                    <th>City</th>
                </thead>
              <tbody>
        
               </tbody>
           </table>
        
        </div>
        </div> -->
  <script src="js/jspdf.js"></script>
  <script src="js/jquery-2.1.3.js"></script>
  <script src="js/pdfFromHTML.js"></script>
  <script src="js/bootstrap.js"></script>
</body>
</html>



