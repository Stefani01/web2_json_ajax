const BASE = "assets/data/";
let nizIdIspisKategorija = Array("#ispisFiltera", "#miniIspisFiltera");
let nizIdIspisMenija = Array("#footerLinkoviMeni", "#navbarMeni");
let nizGrid = Array("#grid2", "#grid3", "#grid4");
let gridKlasa = Array(6, 4, 3);

let objProizvodi = getLocaleStorage("proizvodi");

window.onload = function(){
    $(".loader").fadeToggle("slow");

    $(document).on("click", ".prikazProizvodaPoID", function(){
        let id = $(this).data("id");
        let proizvod = objProizvodi.filter(el => el.id == id);
        ispisiProizvodPoID(proizvod);
    })

    ajaxFunction("meni", "get", function(data){
        nizIdIspisMenija.forEach(el => {
            ispisMenija(data, el);
        });
    });

    ajaxFunction("kategorije", "get", function(data){
        setLocaleStorage("kategorije", data);
    });

    ajaxFunction("proizvodKategorija", "get", function(data){
        setLocaleStorage("proizvodKategorija", data);
        var kategorije = getLocaleStorage("kategorije");

        nizIdIspisKategorija.forEach(el => {
            ispisiKateogorijeProizvoda(kategorije, data, el);
        });
    });

    ajaxFunction("proizvodi", "get", function(data){
        setLocaleStorage("proizvodi", data);
        ispisProizvoda(data, "3", "#ispisProizvoda");
        randomPrikazProizvoda(data);  
    })

    ispisListeZaSortiranje();
    klikIspisProizvoda(nizGrid, gridKlasa);

    ajaxFunction("popust", "get", function(data){
        setLocaleStorage("popust", data);
    })

    if(window.location.pathname == "/prikazProizvoda.html"){
        ispisiProizvodPoID();
    }

}

/* PROVERA UNOSA KOLICINE PROIZVODA */
$(document).on("click", ".povecaj", function(){
    var iznos = Number($("#iznos").val());
    var vratiIznos = iznos+1;
    if(vratiIznos > 1){
        $(".smanji").show();
    }
    $("#iznos").val(vratiIznos);
})

$(document).on("click", ".smanji", function(){
    var iznos = Number($("#iznos").val());
    var vratiIznos = iznos-1;
    if(vratiIznos == 1){
        $(".smanji").hide();
    }
    $("#iznos").val(vratiIznos);
})

$(document).on("blur", "#iznos", function(){
    var vrednost = $(this).val();
    if(Number(vrednost) < 1){
        $(this).val(1);
    }
})

/* FUNKCIJA ZA RANDOM PRIKAZ PROIZVODA */
function randomPrikazProizvoda(proizvodi){
    var broj = [];
    let proizvodiFilter;
    for(let i=0; i<10; i++){
        broj.push(Math.floor((Math.random()*24)+1));
    }
    
    proizvodiFilter = proizvodi.filter(function(el){
        for(let b of broj){
            if(b == el.id){
                return true;
            }
        }
    });

    //ispisTopProizvoda(proizvodiFilter);
}

function ispisTopProizvoda(proizvodi){
    let html = "";
    for(let p of proizvodi){
        html += `<li>
            <a href="prikazProizvoda.html" data-id="${p.id}" class="text-decoration-none link-dark prikazProizvodaPoID text-center">
                <img src="assets/images/${p.slika}" class="rounded d-block mx-auto" alt="${p.alt}">
                <h4 class="m-0">${p.naziv}</h4>
                <p class="mt-2">${p.opis}</p>
                ${obradaCeneIPopusta(p.popust, p.cena)}
                <button class="btn btn-dark bojaShimmer mb-3 d-block mx-auto" data-idKorpa="1">
                    <i class="fas fa-shopping-cart me-2"></i>Dodaj u korpu
                </button>
            </a>
        </li>`;
    }

    $("#autoplay").html(html);
}


/* FUNKCIJA ZA POZIVANJE AJAX-A */
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

/* FUNKCIJE ZA LOCALE STORAGE */
function setLocaleStorage(name, value){
    localStorage.setItem(name, JSON.stringify(value));
}

function getLocaleStorage(name){
    return JSON.parse(localStorage.getItem(name));
}

function removeLocaleStorage(name){
    localStorage.removeItem(name);
}

/* FUNKCIJA ZA ISPIS MENIJA */
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

/* FUNKCIJA ZA ISPIS KATEGORIJA */
function ispisiKateogorijeProizvoda(kat, katProizvod, deoStrane){
    let html = "";

    kat.forEach(k => {
        let katPoId = katProizvod.filter(el => el.idKat == k.id);
        html += `<h5 class="text-center pt-2 pb-2">${k.naziv}</h5>
            ${chbFilterKategorije(katPoId)} `; 
            
    });
    html += chbFilterPaketAkcija();

    $("[name='paket']").click(filtrirajPoPaketima);
    $("[name='popust']").click(filtrirajPoPopustu);
    
    $(deoStrane).html(html);
    $("[name='kategorije']").click(filterPoKategorijama);
}

function chbFilterPaketAkcija(){
    let html = `<div class="mt-5 mb-5 border-top border-bottom p-2">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="truePaketi" name="paket">
                        <label class="form-check-label" for="truePaketi">Paket proizvodi</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="truePopust" name="popust">
                        <label class="form-check-label" for="trueAkcija">Na popustu</label>
                    </div>
                </div>`;
    return html;
}

function chbFilterKategorije(katPoId){
    let html = "";

    for(let kp of katPoId){
        html += `<div class="form-check">
            <input class="form-check-input" type="checkbox" value="${kp.id}" name="kategorije">
            <label class="form-check-label" for="${kp.id}">${kp.naziv}</label>
        </div>`;
    }
    
    return html;
}

/* FUNKCIJA ZA ISPIS DDL ZA SORTIRANJE */
function ispisListeZaSortiranje(){
    let html = `<option value="0">Sortiraj</option>
    <option value="asc">Cena rastuće</option>
    <option value="dsc">Cena opadajuće</option>
    <option value="a-z">Naziv proizvoda A-Z</option>
    <option value="z-a">Naziv proizvoda Z-A</option>`;
    $(".ispisiSort").html(html);
}

/* FUNKCIJA ZA SORTIRANJE */
$(document).on("change", ".ispisiSort", function(){
    let vrednost = $(this).val();
    let sortiraniProizvodi;
    
    if(vrednost == 0){
        sortiraniProizvodi = getLocaleStorage("proizvodi");
    }
    if(vrednost == "asc"){
        sortiraniProizvodi = objProizvodi.sort(function(a,b){
            return a.cena-b.cena;
        })
    }
    if(vrednost == "dsc"){
        sortiraniProizvodi = objProizvodi.sort(function(a,b){
            return b.cena-a.cena;
        })
    }
    if(vrednost == "a-z"){
        sortiraniProizvodi = objProizvodi.sort(function(a,b){
            if(a.naziv < b.naziv){
                return -1;
            }
            if(a.naziv > b.naziv){
                return 1;
            }
            if(a.naziv == b.naziv){
                return 0;
            }
        })
    }
    if(vrednost == "z-a"){
        sortiraniProizvodi = objProizvodi.sort(function(a,b){
            if(a.naziv < b.naziv){
                return 1;
            }
            if(a.naziv > b.naziv){
                return -1;
            }
            if(a.naziv == b.naziv){
                return 0;
            }
        })
    }
    
    ispisProizvoda(sortiraniProizvodi, "3", "#ispisProizvoda");
})

/* FUNCKIJA ZA ISPIS PROIZVODA */
function ispisProizvoda(proizvodi, klasaPrikaz, deoStrane){
    let html = "";

    for(let proizvod of proizvodi){
        html += `   
        <div class="col-12 col-sm-6 col-lg-${klasaPrikaz} mb-3">
            <a href="prikazProizvoda.html" data-id="${proizvod.id}" class="text-decoration-none link-dark prikazProizvodaPoID">
                <figure class="figure d-flex flex-column align-content-end">
                    <img src="assets/images/${proizvod.slika}" class="figure-img img-fluid h-100 rounded" alt="${proizvod.opis}">
                    <figcaption class="figure-caption text-dark">
                        <h2 class="m-0">${proizvod.naziv}</h2>
                        <p class="mt-2">${proizvod.opis}</p>
                        ${obradaCeneIPopusta(proizvod.popust, proizvod.cena)}
                    </figcaption>
                </figure>
            </a>  
            <button class="btn btn-dark bojaShimmer mb-3 d-block mx-auto" data-idkorpa="${proizvod.id}" id="btnKorpaDodaj">
                <i class="fas fa-shopping-cart me-2"></i>Dodaj u korpu
            </button> 
            <div id="modal-bg-korpa">
            <div id="modalKorpa" class="borderShimmer bg-light text-dark p-3 rounded">
                <div class="mb-2 modalX">
                    <i class="fas fa-times d-flex justify-content-end"></i>
                </div>
                <h2 class="text-center p-3 mb-2">Proizvod je dodat u korpu!</h2>
            </div>
        </div>
        </div>`;
    }

    $(deoStrane).html(html);
}

$(document).on("click", ".prikazProizvodaPoID", function(){
    var id = $(this).data("id");
    var proizvodPoID = objProizvodi.filter(el => el.id == id);
    setLocaleStorage("proizvodPoID", proizvodPoID);
})

function ispisiProizvodPoID(){
    let proizvod = getLocaleStorage("proizvodPoID");
    let html ="";
    for(let p of proizvod){
        html += `
                <div class="col-12 col-md-6 text-center align-self-center">
                    <img src="assets/images/${p.slika}" class="figure-img img-fluid h-100 rounded" alt="${p.opis}">
                </div>
                <div class="col-12 col-md-6">
                    <h2 class="text-center">${p.naziv}</h2>
                    <p class="text-center">${p.opis}</p>
                    ${dodatanOpis(p.dodatno)}
                    ${obradaCeneIPopusta(p.popust, p.cena)}
                    <p class="text-end">Količina: 
                        <span class="ps-5 pe-2 smanji">-</span>
                            <span><input type="text" id="iznos" value="1"/></span>
                        <span class="povecaj ps-2">+</span>
                    </p>
                    <div class="row">
                        <div class="col-6">
                            <a href="proizvodi.html" class="btn btn-light"><i class="fas fa-angle-double-left"></i> Svi proizvodi </a>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-dark bojaShimmer mb-3 ms-auto d-block" data-idKorpa="${p.id}" id="btnKorpaDodaj">
                                <i class="fas fa-shopping-cart me-2"></i>Dodaj u korpu
                            </button>
                        </div>
                    </div>
                </div>
                <div id="modal-bg-korpa">
                    <div id="modalKorpa" class="borderShimmer bg-light text-dark p-3 rounded">
                        <div class="mb-2 modalX">
                            <i class="fas fa-times d-flex justify-content-end"></i>
                        </div>
                        <h2 class="text-center p-3 mb-2">Proizvod je dodat u korpu!</h2>
                    </div>
                </div>`;     
    } 
    $("#prikazPoID").html(html);
}

function dodatanOpis(opis){
    let html = "<ul class='mt-4 mb-4'>";
    for(let i = 0; i < opis.length; i++){
        html += `<li>${opis[i]}</li>`
    }
    html += "</ul>";
    return html;
}

/* FUNKCIJA ZA OBRADU CENE I POPUSTA */
function obradaCeneIPopusta(idPopust, cena){
    let html = "";

    if(idPopust == 0){
        html += `<h5 class="text-center mb-3">${prikazCena(cena)}</h5>`;
    }
    else{
        let popust = getLocaleStorage("popust");
        let cenaSaPopustom;
        for(let p of popust){
           if(idPopust == p.id){
                cenaSaPopustom = cena-(cena*p.iznos)/100;
           }
        }
        html += `<h5 class="text-center mb-3"><del>${prikazCena(cena)}<del></h5>
        <h5 class="text-center mb-3">${prikazCena(cenaSaPopustom)}</h5>`;
    }

    return html;
}

/* FUNKCIJA ZA PRIKAZ CENA */
function prikazCena(cena){
    let ispis = "";
    let cenaustring = String(cena);

    if(cenaustring.length == 3){
        ispis = cenaustring.substring(0,3)+",00 RSD";
    }
    if(cenaustring.length == 4){
        ispis = cenaustring.substring(0,1)+"."+cenaustring.substring(1)+",00 RSD";
    }
    if(cenaustring.length == 6){
        ispis = cenaustring.substring(0,1)+"."+cenaustring.substring(1,4)+","+cenaustring.substring(5)+"0 RSD";
    }
    return ispis;
}

/* FUNKCIJE ZA PRIKAZ PROIZVODA PO GRIDU */
function klikIspisProizvoda(nizGrid, gridKlasa){
    for(let i=0; i<nizGrid.length;i++){
        dodeliAkciju(nizGrid[i], gridKlasa[i]);
    }
}

function dodeliAkciju(grid, klasa){
    $(grid).click(function(){
        if(grid == "#grid4"){
            $("#grid4").hide();
        }
        else{
            $("#grid4").show();
        }
        ispisProizvoda(objProizvodi, klasa, "#ispisProizvoda");
    })
}

/* FUNKCIJA ZA PRETRAGU */
$(document).on("keyup","#inputSearch", function(){
    let upisano = $(this).val();
    let proizvodi = getLocaleStorage("proizvodi");
    let filtriranoPoUpisu = proizvodi.filter(p => p.naziv.toLowerCase().indexOf(upisano.toLowerCase()) != -1);

    if(filtriranoPoUpisu.length == 0){
        $("#ispisProizvoda").html(`<p class="text-center mt-5 bg-dark bojaShimmer p-2">Traženi proizvod ne postoji!</p>`);
    }
    else{
        ispisProizvoda(filtriranoPoUpisu, "3", "#ispisProizvoda");
    }

})

/* FILTRIRANJE PO PAKETIMA */
function filtrirajPoPaketima(){
    let filter_paketProizvodi = [];
    let proizvodi = getLocaleStorage("proizvodi");

    if($("input[name='paket']").is(":checked")){
        filter_paketProizvodi = proizvodi.filter(p => p.paket);
    }
    else{
        filter_paketProizvodi = proizvodi;
    }
    //setLocaleStorage("paketProizvodi", filter_paketProizvodi);
    ispisProizvoda(filter_paketProizvodi, "3", "#ispisProizvoda");
}

/* FILTRIRANJE PO AKCIJAMA */
function filtrirajPoPopustu(){
    let filter_proizvodiNaPopustu = [];
    let proizvodi = getLocaleStorage("proizvodi");

    if($("input[name='popust']").is(":checked")){
        filter_proizvodiNaPopustu = proizvodi.filter(p => p.popust != 0);
    }
    else{
        filter_proizvodiNaPopustu = proizvodi;
    }
    ispisProizvoda(filter_proizvodiNaPopustu, "3", "#ispisProizvoda");
}

/* FILTRIRANJE PO KATEGORIJAMA */
function filterPoKategorijama(){
    let proizvodi = getLocaleStorage("proizvodi");
    let cekirano = [];

    $.each($("input[name='kategorije']:checked"), function(){
        cekirano.push($(this).val());
    });
    
    let proizvodiPoKategorijama = proizvodi.filter(function(el){
        for(let cek of cekirano){
            if(cek == el.katProizvod){
                return true;
            }
        }
    })
    
    if(proizvodiPoKategorijama.length == 0){
        proizvodiPoKategorijama = proizvodi;
    }
    
    ispisProizvoda(proizvodiPoKategorijama, "3", "#ispisProizvoda");
}

/* FORMA */
$("#btnPosalji").click(function(){
    let imePrezime, email, poruka, brojGresaka;

    imePrezime = document.querySelector("#tbImePrezime");
    email = document.querySelector("#tbEmail");
    poruka = document.querySelector("#taPoruka");
    brojGresaka = 0;

    let regImePrezime = /^[A-Z][a-z]{2,10}(\s[A-Z][a-z]{2,10})+$/;
    let regEmail = /^^([a-z]{3,15}([\.\_\-]?[a-z0-9]{2,15})*)\@([a-z]{3,10}(\.[a-z]{2,3})+)$/;
    
    if(!$(imePrezime).val().match(regImePrezime)){
        brojGresaka ++;
        $(imePrezime).next().html(`<p class="bg-light text-dark borderShimmer p-1 mt-1 rounded">Uneta vrednost za ime i prezime nije validna !</p>`);
    }
    else{
        $(imePrezime).next().html("");
        $(imePrezime).val("");
    }

    if(!$(email).val().match(regEmail)){
        brojGresaka ++;
        $(email).next().html(`<p class="bg-light text-dark borderShimmer p-1 mt-1 rounded">Uneta email adresa nije validna!</p>`);
    }
    else{
        $(email).next().html("");
        $(email).val("");
    }

    if($(poruka).val().length == 0){
        brojGresaka ++;
        $(poruka).next().html(`<p class="bg-light text-dark borderShimmer p-1 mt-1 rounded">Polje za poruku ne sme biti prazno!</p>`);
    }
    else{
        $(poruka).next().html("");
        $(poruka).val("");
    }

    if(brojGresaka == 0){
        modal("#modal-bg");
    }
})

/* KORPA */
$(document).on("click", "#btnKorpaDodaj", function(){
    modal("#modal-bg-korpa");
    var id = $(this).data("idkorpa");
    obradaKorpe(id);
    //document.querySelector("#brojProizvoda").innerHTML += "1";
  
})

function obradaKorpe(id){
    let korpa = getLocaleStorage("proizvodKorpa");
    let idKorpa;

    if(korpa){
        console.log(korpa);
        for(let k of korpa.proizvod){
            idKorpa = k.id;
        }

        if(id == idKorpa){
            console.log("vec postoji u korpi");
            // proizvod vec postoji u korpi, samo se povecava njegova kolicina
        }
        else{
            // postoji korpa ali ne i taj proizvod
            console.log("else")
        }
    }
    else{
        dodajUKorpu(id);
        // proizvod se tek dodaje u korpu
    }
    
}

function dodajUKorpu(id){
    console.log("nov proizvod");
    let proizvod = objProizvodi.filter(el => el.id == id);
    let prozvodKorpa = {proizvod: [proizvod], kolicina: 1};
    setLocaleStorage("proizvodKorpa", prozvodKorpa);
}

/* FUNKCIJA ZA MODAL */
function modal(idModal){
    $(idModal).addClass("modal_active");
    $(".modalX").click(function(){
        $(idModal).removeClass("modal_active");
    })
}
