const getCurrentList = () => {
    getTapList().then(function(response) {
        console.log('got tap list successfully: ' + JSON.stringify(response));
        populateTaps(response);
    }).catch(function(error) {
        console.log('failed to get tap list: ' + error);
    });
}    

const beerDiv = (aBeer) => {
    const abv = 'abv' in aBeer ? aBeer.abv + '%' : 'N/A';
    const ibu = 'ibu' in aBeer ? aBeer.ibu : 'N/A';
    const price = 'price' in aBeer ? '$' + aBeer.price : 'N/A';
    return  `
        <td width="38%">
            <span class="beerName">${aBeer.beer}</span> - <span style="width: 80%;">${aBeer.style}</span><br> 
            <span class="aboutBeer">${aBeer.brewery}</span>
        </td>
        <td class="smallTD">
            <span class="abv">ABV<br>${abv}</span>
        </td>
        <td class="smallTD">
            <span class="price" >${price}</span>
        </td>
    `;
}

const populateTaps = (currentList) => {
    console.log('populating taps');
    const allTaps = document.getElementById("allTaps");
    let beerTable = '<table id="tapTable" width="100%">';
    if (currentList && currentList.length > 0) {
        console.log('loading list');
        let tapCnt = 0;
        currentList.forEach(aBeer => {
            console.log('tapCnt is ' + tapCnt);
            if (tapCnt % 2 === 0) {
                beerTable += '<tr>'
            }
            beerTable += beerDiv(aBeer);
            if (tapCnt % 2 === 0) {
                beerTable += '<td class="dividerTD"></td>';
            }
            
            if (tapCnt % 2 === 1) {
                beerTable += "</tr>"
            }
            tapCnt++;
        });
        beerTable +="</table>";
        allTaps.innerHTML = beerTable;
    } else {
        console.log('no taps');
        allTaps.innerHTML = "<div style='text-align: center; width: 100%'><span>There is nothing on tap. Please click Edit Tap List in the upper right corner</span></div>";
    }    
}