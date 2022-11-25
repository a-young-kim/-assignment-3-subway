window.onload = function(){
    const btn = document.getElementById('summitbtn');
    btn.disabled = true;
};

function check_name(){
    const name = document.getElementById('name').value;
    const btn = document.getElementById('summitbtn');

    const message = document.getElementById('message');
    if (name == ""){
        message.innerText = "이름을 입력하고 Ready 버튼을 누르세요";
        btn.disabled = true;
        return;
    }

  else{
        message.innerText = "Ready 버튼을 누르세요";
        btn.disabled = false;
        return;
  }
}
