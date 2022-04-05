const express = require('express');
const mongo = require('mongodb');
const axios = require('axios').default;
const cheerio = require('cheerio');
var FormData = require('form-data');
const qs = require('qs');
var cors = require('cors')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors())

app.get('/api/', (req, res) => {
  res.send('');
});

//studia w zakresie (kierunki)
app.post('/api/getDeps', (req, res) => {
  let type = req.body.type;

  axios.post('https://app.ue.poznan.pl/Schedule/Home/GetDepartmentsNameForStudiesType',{type:type})
  .then(function (response) {
    //usuń właściwość selected, zmień nazwy
    let deps = response.data.map(function(x) { 
      delete x.Selected; 
      return {
        id: x.Value,
        name: x.Text
      }; 
    });
    //usuń z listy Instytut oraz inne, czymkolwiek one są, nie działają
    deps = deps.filter(x => x.name != "Instytut" && x.name!="inne")
    
    res.send({status:"ok", message:deps})
  }).catch(function (error) {
    res.send({status:"error", message:error.message+" (from upstream)"})
  })
});

//lata studiów
app.post('/api/getYears', (req, res) => {
  let type = req.body.type;
  let dep = req.body.department;
  let cyc = req.body.cycle;

  axios.post('https://app.ue.poznan.pl/Schedule/Home/GetYear',{type:type, dep:dep, cyc:cyc})
  .then(function (response) {
    //usuń właściwość selected, zmień nazwy
    let years = response.data.map(function(x) { 
      delete x.Selected; 
      return {
        id: x.Value,
        name: x.Text
      }; 
    });
    
    res.send({status:"ok", message:years})
  }).catch(function (error) {
    res.send({status:"error", message:error.message+" (from upstream)"})
  })
});

//grupy rektorskie
app.post('/api/getGroups', (req, res) => {
  let type = req.body.type;
  let dep = req.body.department;
  let cyc = req.body.cycle;
  let year = req.body.year;

  axios.post('https://app.ue.poznan.pl/Schedule/Home/GetGroup',{type:type, dep:dep, cyc:cyc, year:year})
  .then(function (response) {
    //usuń właściwość selected, zmień nazwy
    let groups = response.data.map(function(x) { 
      delete x.Selected; 
      return {
        id: x.Value,
        name: x.Text
      }; 
    });
    
    res.send({status:"ok", message:groups})
  }).catch(function (error) {
    res.send({status:"error", message:error.message+" (from upstream)"})
  })
});

//plan zajęć
app.post('/api/schedule', (req, res) => {
  let type = req.body.type;
  let dep = req.body.department;
  let cyc = req.body.cycle;
  let year = req.body.year;
  let group = req.body.group;

  axios.post('https://app.ue.poznan.pl/Schedule/Home/GetTimeTable',{type:type, dep:dep, cyc:cyc, year:year, group:group})
  .then(function (response) {
    //załaduj html usuwając ukośniki
    const $ = cheerio.load(response.data.replace(/\\/g, ''));

    let schedule = [];

    //znajdź pierwszy table i uzywaj go do generacji planu

    //parsowanie nagłówka (dni tygodnia)
    $('table').first().find('th').each(function(index, value){
      //wpisz do tablicy, usuń znaki nowej linii i spacje, dodaj placeholder na zajęcia
      schedule.push({day:$(value).text().replace(/(\r\n|\n|\r)/gm, "").trim(),classes:[]})
    });

    //parsowanie zajęć
    $('table').first().find('td').each(function(index, value){
      let classes = [];
      //kazdy td to jeden dzień, kazdy p to jedne zajęcia
      $(value).find('p').each(function(index2, value2){
        //rozdziel dane po znakach nowej linii, usuń spacje z godziny zajęć
        let dane = $(value2).text().split("\n");
        dane[0] = dane[0].trim()

        //jeśli widnieje informacja "harmonogram . w hornecie" zamień ją na ładniejszą
        if(dane[2]=="harmonogram"){
          dane[2] = "Harmonogram w Hornecie"
          dane[3] = "Harmonogram w Hornecie"
        }

        //wstaw do tablicy zajęć
        classes.push({time:dane[0],lesson:dane[1],place:dane[2],lecturer:dane[3]})
      })

      //wstaw do placeholdera
      schedule[index].classes = classes
    });

    res.send({status:"ok",message:schedule})
  })
  .catch(function (error) {
    res.send({status:"error", message:error.message+" (from upstream)"})
  })
});

//orion
app.post('/api/spnjo2', (req, res) => {
  let album = req.body.album;

  //orion uywa form-data więc trzeba robić fikoły by działało
  const formData = new FormData()
  formData.append('albumNo',album)
  const headers = {
    ...formData.getHeaders(),
    "Content-Length": formData.getLengthSync()
  };

  axios({url:"https://orion.ue.poznan.pl/LectureGroups/index.php", method:"POST", data: formData, headers: headers})
  .then(function (response) {
    //załaduj html usuwając nowe linie
    let $ = cheerio.load(response.data);
    $("tbody").each(function(index, value){
      console.log(index)
    })
    res.send($('table').html())
  })
});

//hornet [*]
app.post('/api/spnjo', (req, res) => {
  let album = req.body.album;

  //zdobądź wewnętrzne dla spnjo id uzytkownika, parametry przerób na urlencoded
  axios.post('http://hornet.ae.poznan.pl:8080/LectureGroups/searchStudents.htm', qs.stringify({ searchByAlbumNo: album }))
  .then(function (response) {
    //załaduj html usuwając nowe linie
    let $ = cheerio.load(response.data.replace(/\\/g, ''));

    //zdobądź id z html przez diva w #hid i usuń z niego przedrostek "student-"
    let id = $("#hid").find(">:first-child").attr('id').split('-')[1];

    //zdobądź dane studenta z SPNJO po jego wewnętrznym id
    axios.post('http://hornet.ae.poznan.pl:8080/LectureGroups/viewStudent.htm', qs.stringify({ idStudent: id }))
    .then(function (response2) {
      //załaduj html usuwając nowe linie
      let $ = cheerio.load(response2.data.replace(/\\/g, ''));

      //dla kazdego diva z informacjami, parsuj
      //przykładowe dane:
      /*
      Wydział: Informatyka i Analiza Ekonomiczna (od 2019) wartość: IiAE
      Numer albumu wartość: 124953.IiAE
      Kierunek: brak wartość:
      Specjalność: brak wartość:
      Nazwisko i imię wartość:
      Grupa dziekańska wartość: 04
      Typ studiów: stacjonarne wartość: St
      undefined wartość: angielski
      undefined wartość: nr GA06
      (angielski zaawansowany) IiAE (I)
      undefined wartość: rosyjski
      undefined wartość: nr GR78
      (rosyjski początkujący) Ogólnoucz. (I)
      */
      let departmentString;
      let department;
      let albumString;
      let group;
      let typeString;
      let type;
      let languages = [
        {name:"",details:"",group:'',id:null,time:"",place:"",lecturer:""},
        {name:"",details:"",group:'',id:null,time:"",place:"",lecturer:""}
      ];
      //tak, wiem, switch byłby lepszy ale juz nie chciało mi sie przerabiać ;/
      $(".student-details-field").each(function(index, value){
        //dane o wydziale
        if(index==0){
          departmentString = $(value).attr("title").replace('Wydział: ','');
          department = $(value).text().trim();
        }
        //dane o albumie
        else if(index==1){
          albumString = $(value).text().trim();
        }
        //grupa dziekańska
        else if(index==5){
          group = $(value).text().trim();
        }
        //typ studiów
        else if(index==6){
          typeString = $(value).attr("title").replace('Typ studiów: ','');
          type = $(value).text().trim();
        }
        //język 1
        else if(index==7){
          languages[0].name = $(value).text().trim();
        }
        //szczegóły języka 1
        else if(index==8){
          //id dla szczegółów grupy (wytnij dane z onclick, wybierz dane z {})
          languages[0].id = $(value).children().first().attr("onclick").match(/{(.*)}/)[1].replace('idGroup: ','')

          //nazwa grupy
          languages[0].group = $(value).children().remove().text().replace('nr ','');
          languages[0].details = $(value).children().remove().end().text().trim();
        }
        //język 2
        else if(index==9){
          languages[1].name = $(value).text().trim();
        }
        //szczegóły języka 2
        else if(index==10){
          //id dla szczegółów grupy (wytnij dane z onclick, wybierz dane z {})
          languages[1].id = $(value).children().first().attr("onclick").match(/{(.*)}/)[1].replace('idGroup: ','')

          languages[1].group = $(value).children().remove().text().replace('nr ','');
          languages[1].details = $(value).children().remove().end().text().trim();
        }
      })

      //zdobądź dane szczegółowe o językach (prowadzący, miejsce itd)
      //osobna funkcja bo async się pierdolił oczywiście
      getLanguageGroupData(languages).then((year)=>{
        res.send({
          status:"ok",
          message:{
            departmentString:departmentString,
            department:department,
            albumString:albumString,
            group:group,
            typeString:typeString,
            type:type,
            languages:languages,
            year:year
          }
        })
      })
    })
    .catch(function (error2) {
      res.send({status:"error", message:error2.message+" (from upstream)"})
    })
  })
  .catch(function (error) {
    res.send({status:"error", message:error.message+" (from upstream)"})
  })
});

async function getLanguageGroupData(languages){
  let year;
  for(let language of languages){
    let res = await axios.post('http://hornet.ae.poznan.pl:8080/LectureGroups/viewGroupHeader.htm', qs.stringify({ idGroup: language.id }))

    //załaduj html
    let $ = cheerio.load(res.data.replace(/\\/g, ''));

    //dla kazdej komórki z danymi
    $("tr").each(function(index, value){
      //rok
      if(index==0){
        let yearInRoman = $(value).find("td").last().text()
        if(yearInRoman=="I"){year = 1}
        if(yearInRoman=="II"){year = 2}
        if(yearInRoman=="III"){year = 3}
      }
      else if(index==2){
        language.time = $(value).find("td").last().text().trim()
      }
      else if(index==3){
        language.place = $(value).find("td").last().text()
      }
      else if(index==4){
        language.lecturer = $(value).find("td").last().text()
      }
    })
  }
  return year;
}

app.listen(8080, () => console.log('Server started.'));
