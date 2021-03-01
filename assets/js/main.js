const BASE = "assets/data/";
window.onload = function(){

    ajaxFunction("meni", "get", function(data){
        ispisMenija(data, "#footerLinkoviMeni");
        ispisMenija(data, "#navbarMeni");
    })

}

function ajaxFunction(path,method, result){

    $.ajax({
        url: BASE + path + ".json",
        method: method,
        dataType: "json",
        success: result,
        error: function(xhr){
            console.error(xhr);
        }
    })
}

function ispisMenija(meni, deoStrane){
    let html = "";
    for(let m of meni){
        html += `
        <li class="list-group-item border-0">
            <a href="${m.hrefLink}" data-link="${m.id}" class="text-decoration-none">${m.textLink}</a>
        </li> `;
    }
    $(deoStrane).html(html);
}