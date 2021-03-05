$(document).ready(function(){
    
    $("#btnMeni").click(function(){
        $("#meniToggle").slideToggle(1000);
    })
    
    var nizElKojimaSeDodeljujeAnimacijaSlideToggle = Array("#test", "#slanje", "#kupovina", "#ostecenje", "#proizvod", "#otvoriFilter", "#otvoriSort");
    dodeliAnimacijuSlideToggle(nizElKojimaSeDodeljujeAnimacijaSlideToggle);
   
    
})

function dodeliAnimacijuSlideToggle(niz){
    niz.forEach(element => {
        elementSLideToggle(element);
    });
}

function elementSLideToggle(elementClick){
    $(elementClick).click(function(){
        var element = $(this);
        element.next().slideToggle('slow');
        element.find(".fa-chevron-down").toggle();
        element.find(".fa-chevron-up").toggle();
    })
}

$(".karticaZasto").hover(function(){

    $(this).animate({
        padding:  "+=25px",
        fontSize: "+=2px"
    }, 2000)

}, function(){

    $(this).stop(true, true);
    $(this).animate({
        padding: "-=25px",
        fontSize: "-=2px"
    }, 1000)

})

