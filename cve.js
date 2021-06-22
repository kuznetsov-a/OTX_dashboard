let json_numbers, json_types, array_types, json_cve, array_cve, json_contries, array_countries, dates, dates_text = null

async function load_file(path) {
    let out_json = null
    await fetch(path)
        .then((response) => {
            return response.json()
        })
        .then((result) => { out_json = result })
        .catch((error) => {
            console.log(`Error loading file ${path}`)
            console.log(error)
        })

    
    return out_json
}

async function load_data() {
    json_countries = await load_file('./IP_90.json')
    array_countries = Object.values(json_countries['date']).map((d, i) => {
        return [d,
            Object.values(json_countries['country'])[i],
            Object.values(json_countries['count'])[i]]
    })

    json_cve = await load_file('./CVE_90.json')
    array_cve = Object.values(json_cve['date']).map((d, i) => {
        return [d,
            Object.values(json_cve['CVE'])[i],
            Object.values(json_cve['count'])[i]]
    })

    json_types = await load_file('./Types_90.json')
    array_types = Object.values(json_types['date']).map((d, i) => {
        return [d,
            Object.values(json_types['type'])[i],
            Object.values(json_types['count'])[i]]
    })

    json_numbers = await load_file('./Counts_90.json')
    dates = Object.values(json_numbers['date'])
    console.log(dates)

    let date_select = document.getElementById('input_date')
    dates_text = dates.map(d => {
        s = new Date(d).toLocaleDateString("en-UK")
        return s
    })
    for (var i = 0; i < dates.length; i++) {
        var opt = document.createElement('option');
        opt.value = dates[i];
        opt.innerHTML = dates_text[i];
        date_select.appendChild(opt);
    }
    date_select.addEventListener('change', draw_charts)

}


function draw_charts() {
    let date_select = document.getElementById('input_date')
    let date = date_select.value
    console.log(date)


    let X = dates_text
    let Y = Object.values(json_numbers['count'])

    line_layout = {
        title: 'Line - # of indicators by date',
        autosize: true,

    }
    Plotly.newPlot('chart_line', [{
        x: X,
        y: Y,
        type: 'scatter',
        mode: 'line',
    }],
        line_layout)

    let types_date = array_types.filter(e => {
        return e[0] == date
    })

    X = types_date.map(td => td[1])
    Y = types_date.map(td => td[2])

    Plotly.newPlot('chart_pie', [{
        labels: X,
        values: Y,
        type: 'pie'
    }], {
        title: 'Pie - indicators by type for date',
        autosize: true


    })

    let cve_date = array_cve.filter(e => {
        return e[0] == date
    })

    X = cve_date.map(td => td[1])
    Y = cve_date.map(td => td[2])
    if (X.length > 0) {
        document.getElementById('chart_bar').innerText = ''
        Plotly.newPlot('chart_bar', [{
            x: X,
            y: Y,
            type: 'bar'


        }], {
            title: 'Bar - # of CVEs for date',
            autosize: true


        })
    }
    else {
        document.getElementById('chart_bar').innerText = 'No CVEs reported for this date'
    }

    let countries_date = array_countries.filter(e => {
        return e[0] == date
    })

    X = countries_date.map(td => td[1])
    Y = countries_date.map(td => td[2])
    map_data = [
        {
            type: 'scattergeo',
            mode: 'markers',
            locationmode: 'country names',
            locations: X,
            text: Y,

            marker: {
                size: Y.map(v => v * 10)
            }
        }]
    map_layout = {
        title: 'Map - IPs by country',
        'geo': {
            'showcountries': true,
            'countrycolor': 'black'
        },


        autosize: true,

        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 50
        }
    }
    Plotly.newPlot('chart_map', map_data, map_layout)
}



window.addEventListener('load', load_data());
