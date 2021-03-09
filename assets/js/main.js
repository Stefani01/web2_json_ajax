const BASE = "assets/data/";
let nizIdIspisKategorija = Array("#ispisFiltera", "#miniIspisFiltera");
let nizIdIspisMenija = Array("#footerLinkoviMeni", "#navbarMeni");
let nizGrid = Array("#grid2", "#grid3", "#grid4");
let gridKlasa = Array(6, 4, 3);

let objProizvodi = getLocaleStorage("proizvodi");

$(document).ready(function(){
    $("#btnMeni").click(function(){
        $("#meniToggle").slideToggle(1000);
    })
        
    $('.multiple-items').slick({
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 1500,
        dots: false,
        responsive: [
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: true,
                dots: false
              }
            },
            {
              breakpoint: 600,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 2
              }
            },
            {
              breakpoint: 480,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1
              }
            }
          ]
      });
    

    var nizElKojimaSeDodeljujeAnimacijaSlideToggle = Array("#test", "#slanje", "#kupovina", "#ostecenje", "#proizvod", "#otvoriFilter", "#otvoriSort");
    dodeliAnimacijuSlideToggle(nizElKojimaSeDodeljujeAnimacijaSlideToggle);

    var kolicina = 1;
    localStorage.setItem("kolicina", kolicina);
    
    $(".loader").fadeToggle("slow");

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
        slajderIspis(data);
    })

    ispisListeZaSortiranje();
    klikIspisProizvoda(nizGrid, gridKlasa);

    ajaxFunction("popust", "get", function(data){
        setLocaleStorage("popust", data);
    })

    if(getLocaleStorage("proizvodPoID")){
        ispisiProizvodPoID();
    }
    
    
    proveraKorpe();
})

function slajderIspis(proizvodi){
    let randomBrojevi = [];
    for(let i=0; i<8; i++){
        let random = Math.floor(Math.random()*24)+1;
        randomBrojevi.push(random);
    }
    
    let randomProizvodi = proizvodi.filter(function(el){
        for(let i=0; i<randomBrojevi.length; i++){
            if(el.id == randomBrojevi[i]){
                return true;
            }
        }
    })
    ispisRandomProizvoda(randomProizvodi);
}

function ispisRandomProizvoda(proizvodi){
    let html = "";
    for(let proizvod of proizvodi){
        html += `
            <a href="prikazProizvoda.html" data-id="${proizvod.id}" class="text-decoration-none link-dark prikazProizvodaPoID items m-2">
            <figure class="figure d-flex flex-column align-content-end">
                <img src="assets/images/${proizvod.slika}" class="figure-img img-fluid h-100 rounded" alt="${proizvod.opis}">
                <figcaption class="figure-caption text-dark">
                    <h3 class="m-0">${proizvod.naziv}</h3>
                    <p class="mt-2">${proizvod.opis}</p>
                </figcaption>
            </figure>
        </a>`;
    }
    $("#slajderIspis").html(html);
    ispisiProizvodPoID();
}

$(".korpaIspis").click(function(){
    location.reload();
    console.log("kliknuto na korpu");
    proveraKorpe();
})
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

/* PROVERA UNOSA KOLICINE PROIZVODA */
$(document).on("click", ".povecaj", function(){
    var iznos = Number($(".iznos").val());
    var vratiIznos = iznos+1;
    if(vratiIznos > 1){
        $(".smanji").show();
    }
    $(".iznos").val(vratiIznos);
    localStorage.setItem("kolicina", vratiIznos);
})

$(document).on("click", ".smanji", function(){
    var iznos = Number($(".iznos").val());
    var vratiIznos = iznos-1;
    if(vratiIznos == 1){
        $(".smanji").hide();
    }
    $(".iznos").val(vratiIznos);
    localStorage.setItem("kolicina", vratiIznos);
})

/* FUNKCIJA ZA SORTIRANJE */
$(document).on("change", ".ispisiSort", function(){
    let vrednost = $(this).val();
    let proizvodi = getLocaleStorage("proizvodi");
    let sortiraniProizvodi;

    if(vrednost == 0){
        sortiraniProizvodi = proizvodi;
    } 
    
    if(vrednost == "asc"){
        sortiraniProizvodi = proizvodi.sort(function(a,b){
            return a.cena-b.cena;
        })
    }
    if(vrednost == "dsc"){
        sortiraniProizvodi = proizvodi.sort(function(a,b){
            return b.cena-a.cena;
        })
    }
    if(vrednost == "a-z"){
        sortiraniProizvodi = proizvodi.sort(function(a,b){
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
        sortiraniProizvodi = proizvodi.sort(function(a,b){
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
                        <h3 class="m-0">${proizvod.naziv}</h3>
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
    ispisiProizvodPoID();
})

function ispisiProizvodPoID(){
    let proizvod = getLocaleStorage("proizvodPoID");
    let proizvodiIzKorpe = getLocaleStorage("proizvodKorpa");
    let html ="";
    let vrednost = getLocaleStorage("kolicina");
    for(let p of proizvod){
        if(proizvodiIzKorpe){
            for(let k of proizvodiIzKorpe){
                if(k.proizvod == p.id){
                    vrednost = k.kolicina;
                }
            }
        }
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
                            <span><input type="text" class="iznos" value="${vrednost}" disabled/></span>
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
    if(cenaustring.length >= 5){
        ispis = cenaustring.substring(0,2)+"."+cenaustring.substring(2,5)+","+cenaustring.substring(6,7)+"0 RSD";
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
    let filtriranoPoUpisu = [];
    let proizvodiPoKat = getLocaleStorage("proizvodiPoKat");

    if(proizvodiPoKat){
        filtriranoPoUpisu = proizvodiPoKat.filter(p => p.naziv.toLowerCase().indexOf(upisano.toLowerCase()) != -1);
    }
    else{
        filtriranoPoUpisu = objProizvodi.filter(p => p.naziv.toLowerCase().indexOf(upisano.toLowerCase()) != -1);
    }

    if(filtriranoPoUpisu.length == 0){
        $("#ispisProizvoda").html(`<p class="text-center mt-5 bg-dark bojaShimmer p-2">Traženi proizvod ne postoji!</p>`);
    }
    else{
        ispisProizvoda(filtriranoPoUpisu, "3", "#ispisProizvoda");
    }

})

/* FILTRIRANJE PO PAKETIMA */
function filtrirajPoPaketima(){
    let filter_paketProizvodi = dodatnoFiltriranje();
    if(filter_paketProizvodi.length == 0){
        $("#ispisProizvoda").html(`<p class="text-center mt-5 bg-dark bojaShimmer p-2">Proizvod sa zadatim filterima ne postoji!</p>`);
    }
    else{
        ispisProizvoda(filter_paketProizvodi, "3", "#ispisProizvoda");  
    }
}

/* FILTRIRANJE PO AKCIJAMA */
function filtrirajPoPopustu(){
    let filter_proizvodiNaPopustu = dodatnoFiltriranje();
    if(filter_proizvodiNaPopustu.length == 0){
        $("#ispisProizvoda").html(`<p class="text-center mt-5 bg-dark bojaShimmer p-2">Proizvod sa zadatim filterima ne postoji!</p>`);
    }
    else{
        ispisProizvoda(filter_proizvodiNaPopustu, "3", "#ispisProizvoda");
    }
}

function dodatnoFiltriranje(){
    let proizvodi = getLocaleStorage("proizvodi");
    let proizvodPoKat = getLocaleStorage("proizvodiPoKat");
    let rezultat = [];
    let uspeh = false;
    if(($("input[name='paket']").is(":checked")) && ($("input[name='popust']").is(":checked"))){
        if(proizvodPoKat){
            rezultat = proizvodPoKat.filter(el => el.popust != 0 && el.paket); 
            uspeh = true;
        }
        else{
            rezultat = proizvodi.filter(el => el.popust != 0 && el.paket); 
            uspeh = true;
        } 
    }
    if($("input[name='paket']").is(":checked")){
        if(proizvodPoKat){
            rezultat = proizvodPoKat.filter(el => el.paket); 
            uspeh = true;
        }
        else{
            rezultat = proizvodi.filter(el => el.paket); 
            uspeh = true;
        }
    }
    if($("input[name='popust']").is(":checked")){
        if(proizvodPoKat){
            rezultat = proizvodPoKat.filter(el => el.popust != 0); 
            uspeh = true;
        }
        else{
            rezultat = proizvodi.filter(el => el.popust != 0); 
            uspeh = true;
        }
    }
    
    if(!uspeh){
        if(proizvodPoKat){
            rezultat = proizvodPoKat;
        }
        else{
            rezultat = objProizvodi;
        }
    }

    setLocaleStorage("proizvodi", rezultat);
    return rezultat;
    
}
/* FILTRIRANJE PO KATEGORIJAMA */
function filterPoKategorijama(){
    let proizvodi = getLocaleStorage("proizvodi");
    let proizvodPoKat = getLocaleStorage("proizvodiPoKat");
    let cekirano = [];

    $.each($("input[name='kategorije']:checked"), function(){
        cekirano.push($(this).val());
    });
    
    let proizvodiPoKategorijama = objProizvodi.filter(function(el){
        for(let cek of cekirano){
            if(cek == el.katProizvod){
                return true;
            }
        }
    })
    
    if(proizvodiPoKategorijama.length == 0){
        removeLocaleStorage("proizvodiPoKat");
        proizvodiPoKategorijama = objProizvodi;
    }
    setLocaleStorage("proizvodiPoKat", proizvodiPoKategorijama);
    ispisProizvoda(proizvodiPoKategorijama, "3", "#ispisProizvoda");
}

/* FORMA */
$("#btnPosalji").click(function(){
    imePrezime = document.querySelector("#tbImePrezime");
    email = document.querySelector("#tbEmail");
    poruka = document.querySelector("#taPoruka");
    brojGresaka = 0;

    let regImePrezime = /^[A-Z][a-z]{2,10}(\s[A-Z][a-z]{2,10})+$/;
    let regEmail = /^^([a-z]{3,15}([\.\_\-]?[a-z0-9]{2,15})*)\@([a-z]{3,10}(\.[a-z]{2,3})+)$/;
    
    let nizPromenljive = [imePrezime, email];
    let nizReg = [regImePrezime, regEmail];
    let nizIspis = [
        "Uneta vrednost za ime i prezime nije validna !",
        "Uneta email adresa nije validna!"
    ]
    for(let i=0; i<nizPromenljive.length; i++){
        brojGresaka += proveraRegularnihIzraza(nizReg[i],nizPromenljive[i], nizIspis[i])
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
})

function obradaKorpe(id){
    let korpa = getLocaleStorage("proizvodKorpa");
    let idIzKorpe;
    if(korpa){
        for(let k of korpa){
            if(id == k.proizvod){
                idIzKorpe = k.proizvod;
            }
        }
        if(idIzKorpe){
            azurirajProizvodUKorpi(id);
        }
        else{
            dodajNovProizvodUKorpu(id);
            osveziKorpu();
        }
    }
    else{
        dodajPrviProizvodUKorpu(id);
        osveziKorpu();
    }
    
}

function dodajPrviProizvodUKorpu(id){
    let dodajNovProizvod = [];
    let broj = vratiKolicinu();
    dodajNovProizvod[0] = {proizvod: id, kolicina: broj};
    setLocaleStorage("proizvodKorpa", dodajNovProizvod);
}

function azurirajProizvodUKorpi(id){
    let proizvod = getLocaleStorage("proizvodKorpa");
    let broj = vratiKolicinu();
    for(let p of proizvod){
        if(p.proizvod == id){
           p.kolicina = broj; break;
        }
    }
    setLocaleStorage("proizvodKorpa", proizvod);
}

function dodajNovProizvodUKorpu(id){
    let proizvodiIzKorpe = getLocaleStorage("proizvodKorpa");
    let broj = vratiKolicinu();
    proizvodiIzKorpe.push({proizvod: id, kolicina: broj});
    setLocaleStorage("proizvodKorpa", proizvodiIzKorpe);
}

function vratiKolicinu(){
    let brojProizvoda = localStorage.getItem("kolicina");
    return Number(brojProizvoda);
}

function osveziKorpu(){
    var proizvodi = getLocaleStorage("proizvodKorpa");
    let brojProizvodaUKorpi;
    if(proizvodi){
        brojProizvodaUKorpi = proizvodi.length;
    }
    if(brojProizvodaUKorpi){  
        $(".brojProizvoda").html(`<span class="fas fa-shopping-cart pe-2 ms-2 ms-2" ></span>${brojProizvodaUKorpi}`);
    }
    else{
        $(".brojProizvoda").html(`<span class="fas fa-shopping-cart pe-2 ms-2 ms-2" ></span>`);
    }
}

function proveraKorpe(){
    let korpa = getLocaleStorage("proizvodKorpa");
    let brojProizvodaUKorpi;
    if(korpa){
        brojProizvodaUKorpi = korpa.length;
    }
    if(brojProizvodaUKorpi){
        ispisiProizvodeIzKorpe();
        $("#dodatno").show();
    }
    else{
        obavestenjeKorpa();
        $("#dodatno").hide();
    }
    osveziKorpu();
}

function obavestenjeKorpa(){
    let html = `<div class="col-6 mx-auto">
        <p class="bg-dark bojaShimmer text-center p-2 rounded">Trenutno nema proizvoda u korpi!</p>
        <div class="d-grid gap-2">
            <a href="proizvodi.html" class="btn btn-light"><i class="fas fa-angle-double-left bojaShimmer me-2"></i>Nastavi sa kupovinom </a>
        </div>
    </div>`;
    $("#rezultatKorpa").html(html);
}

function ispisiProizvodeIzKorpe(){
    let tabela = ` <div class="table-responsive">
    <table class="table" id="tabelaProizvodiKorpa">
                        <thead>
                            <tr>
                            <th scope="col">#</th>
                            <th scope="col">Proizvod</th>
                            <th scope="col"></th>
                            <th scope="col">Količina</th>
                            <th scope="col">Ukupno</th>
                            <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>`;
                        tabela += ispis();
    tabela += `</tbody></table></div>`;
    $("#rezultatKorpa").html(tabela);
}

function ispis(){
    let korpa = getLocaleStorage("proizvodKorpa");
    var idProizvoda, kolicinaProizvoda, proizvod;
    
    let html = "";
    let rb = 1;
    for(let k of korpa){
        idProizvoda = k.proizvod;
        kolicinaProizvoda = k.kolicina;
        if(kolicinaProizvoda > 1){
            $(".smanji").show();
        }
        proizvod = objProizvodi.filter(el => el.id == idProizvoda);
        for(let p of proizvod){
            html += `<tr>
                            <th scope="row">${rb}</th>
                            <td id="slika">
                            <a href="prikazProizvoda.html" data-id="${p.id}" class="text-decoration-none link-dark prikazProizvodaPoID">
                                <img src="assets/images/${p.slika}" alt="${p.opis}">
                            </a>
                            </td>
                            <td class="text-center">${p.naziv}</td>
                            <td>${kolicinaProizvoda}</td>
                            <td id="cena" class="text-center">${izracunaj(p.cena, kolicinaProizvoda, p.popust)}</td>
                            <td class="bojaShimmer"><i class="fas fa-trash-alt" id="obrisiIzKorpe" data-id=${p.id}></i></td>
                        </tr>`;
            rb++;
        }
    }
    return html;
}

$(document).on("click", "#obrisiIzKorpe", function(){
    let id = $(this).data("id");
    let proizvodi = getLocaleStorage("proizvodKorpa");
    let vratiUStorage = proizvodi.filter(el => el.proizvod != id);
    setLocaleStorage("proizvodKorpa", vratiUStorage);
    smanji(id);
    proveraKorpe();
})

function smanji(id){
    let obrisanProizvod = objProizvodi.filter(el => el.id == id);
    let cenaObrisanogProizvoda;
    for(let p of obrisanProizvod){
        cenaObrisanogProizvoda = p.cena;
    }
    sveUkupno = localStorage.getItem("sveUkupno");
    vratiCenu = sveUkupno - cenaObrisanogProizvoda;
    location.reload();
    krajnjiRezultat(vratiCenu);  
}

function izracunaj(cena,kol, idp){
    let kolicina = Number(kol);
    var ukupnaCena = cena*kolicina;
    let popust = getLocaleStorage("popust");
    let prikazi;
    if(idp == 0){
        prikazi = prikazCena(ukupnaCena);
    }
    else{
        for(let p of popust){
            if(idp == p.id){
                 cenaSaPopustom = ukupnaCena-(ukupnaCena*p.iznos)/100; break;
            }
        }
        prikazi = prikazCena(cenaSaPopustom);
        ukupnaCena = cenaSaPopustom;
    }
    console.log(ukupnaCena);
    localStorage.setItem("ukupnaCena", ukupnaCena);
    krajnjiRezultat(ukupnaCena);
    return prikazi;
}

var zbir = 0;
function krajnjiRezultat(ukupnaCena){
    zbir += ukupnaCena;
    let dostava = obradiDostavu(zbir);
    let prikazi = `${prikazCena(zbir)}`;
    console.log(zbir);
    console.log(prikazi);
    $("#ukupanIznos").html(prikazi);
    ukupanIznosPorudzbine(zbir, dostava);
    localStorage.setItem("sveUkupno", zbir);
}

function obradiDostavu(ukupnaCena){
    let ispis = "";
    let dostava;
    if(ukupnaCena <= 5000){
        dostava = 550;
        ispis += `${prikazCena(dostava)}`;
    }
    else{
        dostava = 0;
        ispis += `0 RSD`;
    }
    $("#dostava").html(ispis);
    return dostava;
}
function ukupanIznosPorudzbine(zbir,dostava){
    var sveUkupno = zbir + dostava;
    console.log(sveUkupno);
    let prikazi = `${prikazCena(sveUkupno)}`;
    console.log(prikazi);
    $("#ukupno").html(prikazi);
    localStorage.setItem("iznosPorudzbine", sveUkupno);
}

$("#btnNaruci").click(function(){
    modal("#modal-bg-porudzbinaForma");
})

$("#btnZavrsi").click(function(){
    imePrezime = document.querySelector("#pImePrezime");
    email = document.querySelector("#pEmail");
    adresa = document.querySelector("#pAdresa");
    brTelefona = document.querySelector("#pBrTelefona");

    brojGresaka = 0;

    let regImePrezime = /^[A-ZŠĐŽČĆ][a-zšđžčć]{2,10}(\s[A-ZŠĐŽČĆ][a-zšđžčć]{2,10})+$/;
    let regEmail = /^^([a-z]{3,15}([\.\_\-]?[a-z0-9]{2,15})*)\@([a-z]{3,10}(\.[a-z]{2,3})+)$/;
    let regAdresa = /^[ZŠĐŽČĆzšđžčć\w\d\s]+$/;
    let regBrTelefona = /^06[0-9]([0-9\s\-]{6,7})$/;
    
    let nizPromenljive = [imePrezime, email, adresa, brTelefona];
    let nizReg = [regImePrezime, regEmail, regAdresa, regBrTelefona];
    let nizIspis = [
        "Uneta vrednost za ime i prezime nije validna!",
        "Uneta email adresa nije validna!",
        "Uneta adresa nije validna!",
        "Unet format broja telefona nije validan"
    ]
    for(let i=0; i<nizPromenljive.length; i++){
        brojGresaka += proveraRegularnihIzraza(nizReg[i], nizPromenljive[i], nizIspis[i]);
    }
    
    if(brojGresaka == 0){
        $("#ispisPorudzbina").html(`<p class="bg-light text-dark borderShimmer p-2 mt-3">Uspešno ste izvršili porudžbinu!</p>`);
    }
})
/* KRAJ KORPE */

/* FUNKCIJA ZA MODAL */
function modal(idModal){
    $(idModal).addClass("modal_active");
    $(".modalX").click(function(){
        $(idModal).removeClass("modal_active");
    })
}

function proveraRegularnihIzraza(regIzraz,vrednost, ispis){
    var brojGresaka = 0;
    if(!$(vrednost).val().match(regIzraz)){
        brojGresaka++;
        $(vrednost).next().html(`<p class="bg-light text-dark borderShimmer p-1 mt-1 rounded">${ispis}</p>`);
    }
    else{
        $(vrednost).next().html("");
        $(vrednost).val("");
    }
    return brojGresaka;
}

$("#btnAutor").click(function(){
    modal("#modal-bg-autor");
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

      