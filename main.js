var time=0;
var s=0;
$('#start').on('click',start);
$('#stop').on('click',stop);
function start(){
    $('button').css("margin-top","1vh");
    window.s=0;
    main();
    getToken();
}
function main(){
    console.log(window.s);
    if(s==0){
        SendWall(kek);
        setTimeout(main,10000);
    }
}
function stop(){
    window.time=0;
    window.s=1;
    $('li').detach();
    $('button').css("margin-top","35vh");
}
function kek(data){
    var t=0;
    t=data.response.items[0].date;
    if(t>window.time){                                               
        Draw(data.response.items);
        window.time=t;
        if(wordTest(data.response.items[0])){
           sendNotification("pop");
        }
    }
    }
function SendWall(func) {
    $.ajax({
            url: 'https://api.vk.com/method/wall.get?owner_id=-72869598&access_token=7f3629b97f3629b97f3629b9697f6941a377f367f3629b9253223cad23152f5165cccfe&count=20&filter=othets&v=5.52',
            method: 'GET',
            dataType: 'JSONP',
            success: func
        });
}

function Draw(posts){
    var html = '';
    var count=0;
    for(var i=0;(i<posts.length)&&(count<6);i++){
        p=posts[i];
        if(wordTest(p)){
            html+='<li>'+p.text.toLowerCase()+'</li>';
            count++;
            
        }
    }
    $('ul').html(html);
}
function wordTest(p){
    var trigger_words=["как","где","?"];
    for(var j=0;j<trigger_words.length;)
    {
         var k=p.text.toLowerCase().indexOf(trigger_words[j]);
        if(k==-1){
            j++
        }
        else{
            return false;
        }
        }
    return true;
}