// Create state for window
const selectLanguage = document.getElementById('translation'), 
selectTranslation = document.getElementById('language'), 
selectMinYear = document.getElementById('minYear'), 
selectMaxYear = document.getElementById('maxYear'),
selectChartType = document.getElementById('chartType')
chartDiv = document.getElementById('chart'),
addNewTab = document.querySelector('.create.tab')
document.getElementById('add-tab').addEventListener

openCreateTab = () => {
    // Break if the tab is already openend
    if (addNewTab.classList.contains('openend')) {
        return
    }
    addNewTab.classList.add('openend')
}

document.querySelector('.add-new').addEventListener('click', openCreateTab)
document.querySelectorAll('.fas.fa-times').forEach(button => 
    button.addEventListener('click', removeTab)    
)

setTabText = () => {
    valueToText = (type, code) => {
        return document.querySelector(`.options #${type} option[value=${code}]`).textContent
    }
    const language = document.querySelector('.options #language').value
    const translation = document.querySelector('.options #translation').value

    if (translation !== 'null') {
        return `Boeken vertaald van het ${valueToText('translation', translation)} naar ${valueToText('language', language)}`
    } else {
        return `Boeken in het ${valueToText('language', language)}`
    }
}

createNewTab = () => {
    addNewTab.classList.remove('openend')
    // Create color element inside tab:
    let colorDiv = document.createElement('div')
    let colorClass = document.createAttribute('class')
    let colorStyle = document.createAttribute('style')
    colorStyle.value = `background-color: ${document.querySelector('.options #color').value};`
    colorClass.value = 'color'
    colorDiv.setAttributeNode(colorClass)
    colorDiv.setAttributeNode(colorStyle)
    // Create text
    let h2Text = document.createElement('h2')
    h2Text.appendChild(document.createTextNode(setTabText()))
    // Create delete button
    let deleteDiv = document.createElement('i')
    let deleteClass = document.createAttribute('class')
    deleteClass.value = 'fas fa-times'
    deleteDiv.setAttributeNode(deleteClass)

    const tabs = document.getElementById('tabs')
    let thisTab = document.createElement('div')
    let thisValue = document.createAttribute('value')
    let thisColor = document.createAttribute('color')
    let thisClass = document.createAttribute('class')

    thisClass.value = 'tab'
    thisValue.value = (document.querySelector('.options #translation').value === 'null' ? '' : document.querySelector('.options #translation').value) + document.querySelector('.options #language').value
    thisColor.value = document.querySelector('.options #color').value

    thisTab.setAttributeNode(thisClass)
    thisTab.setAttributeNode(thisValue)
    thisTab.setAttributeNode(thisColor)

    thisTab.append(colorDiv)
    thisTab.append(h2Text)
    thisTab.append(deleteDiv)
    tabs.prepend(thisTab)

    document.querySelectorAll('.fas.fa-times').forEach(button => 
        button.addEventListener('click', removeTab)    
    )
    
    renderGraph()
}
document.getElementById('add-tab').addEventListener('click', createNewTab)


function removeTab() {
    this.parentElement.remove()
    renderGraph()
}

const state = {
    minYear: Number(selectMinYear.value),
    maxYear: Number(selectMaxYear.value),
    language: selectLanguage.value,
    translation: selectTranslation.value,
    chartType: selectChartType.value
}

changeState = (key, value) => {
    state[key] = value
    renderGraph()
}

selectMinYear.addEventListener('change', () => changeState('minYear', Number(selectMinYear.value)))
selectMaxYear.addEventListener('change', () => changeState('maxYear', Number(selectMaxYear.value)))
selectLanguage.addEventListener('change', () => changeState('language', selectLanguage.value))
selectTranslation.addEventListener('change', () => changeState('translation', selectTranslation.value))
selectChartType.addEventListener('change', () => changeState('chartType', selectChartType.value))
// window.addEventListener('resize', () => renderGraph())

getIndexOfProperty = (key, value) => {
    return state.standardData.map(e => e[key]).indexOf(value)
}

makeGraph = data => {
    let windowWidth = window.innerWidth
    const margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = (windowWidth * 0.7) - margin.left - margin.right
        height = 600 - margin.top - margin.bottom

    d3.selectAll('svg').remove()
    const svg = d3.select('#chart')
        .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
        .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.bottom})`)

    let parseDate = d3.timeParse('%Y'),
        x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0])

    areaGenerator = (data, langCode) => {
        let area = d3.area()
        .curve(d3.curveStep)
        .x(d => x(parseDate(d.year)))
        .y0(y(0))
        .y1(d => y(d[langCode]))
        return area(data)
    }

    x.domain(d3.extent(data, d => parseDate(d.year))).tickFormat(d3.timeFormat("%Y"))
    y.domain([0, d3.max(data, d => d.dut)]).nice()

    let tickLength = data.length > 30 ? 20 : d3.timeYear
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).ticks(tickLength))

    svg.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(y))
        .append('text')
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("fill", "#000")
            .text("Aantal boeken");

    const tabs = [].slice.call(document.querySelectorAll('.tab'), 0).reverse()
    tabs.forEach(tab => {
        if (tab.getAttribute('class') === 'create tab') {
            return
        }

        let lang = tab.getAttribute('value')
        let color = tab.getAttribute('color')

        svg.append('path')
        .attr('d', areaGenerator(data, lang))
        .style('fill', color)
        .attr('class', lang)
        .style('opacity', '0.5')
    })

    svg.selectAll('.yearbar')
        .data(data)
        .enter().append('g')
        .attr('class', 'yearbar')
            .append('text')
            .attr('y', 20)
            .attr('x', d => x(parseDate(d.year)))
            .attr('text-anchor', 'middle')
            .text(d => d.year)

    tabs.forEach(tab => {
        if (tab.getAttribute('class') === 'create tab') {
            return
        }

        let lang = tab.getAttribute('value')

        d3.selectAll('.yearbar')
        .append('text')
            .data(data)
            .attr('y', d => y(d[lang]) - 5)
            .attr('x', d => x(parseDate(d.year)))
            .attr('text-anchor', 'middle')
            .text(d => d[lang])
    })

            
    d3.selectAll('.yearbar').append('rect')
        .data(data)
        .attr('x', d => x(parseDate(d.year)))
        .attr('height', height)
        .attr('width', width / data.length)
        .attr('transform', `translate(${-(width/data.length)/2}, 0)`)

    

    // svg.selectAll('text.eng')
    //     .data(data)
    //     .enter().append('text')
    //     .attr('class', 'eng label')
    //     .attr('text-anchor', 'middle')
    //     .attr('x', d => x(parseDate(d.year)))
    //     .attr('y', d => y(d['eng']))
    //     .text(d => `${d.year}: ${d['eng']}`)

    
}

renderGraph = () => {
    let data
    if (state.chartType === 'cumulativeData') {
        data = [...state.cumulativeData]
    } else {
        data = [...state.standardData]
    }
    let minYearIndex = getIndexOfProperty('year', state.minYear)
    let maxYearIndex = getIndexOfProperty('year', state.maxYear) + 1
    let splicePoint = maxYearIndex - minYearIndex
    data = data.splice(minYearIndex, splicePoint)
    makeGraph(data)
}

// Temporary Storage for each year, shitty hack but w/e
let currentNumbers = {}
getCumulative = (year, data) => {
    // This function creates per given year, from the for loop, an object which sorts out all the languages, languages that are translated get a double language code f.e english to dutch = engdut.
    let total = {
        year: year,
    }

    let langCodes = []
    data.forEach(book => {
        if (Number(book.pubYear) === year) {
            let lang = book.language === null ? 'nolang' : book.language
            let origin = book.originLang === null ? '' : book.originLang
            lang === origin ? origin = '' : false

            langCodes.push(origin + lang)
        }
    })

    langCodes.forEach(langCode => {
        return !total[langCode] ? (total[langCode] = 1) : total[langCode]++
    })

    // splice(1) is removing the year which we want to avoid counting.
    let totalLangs = Object.keys(total).splice(1)
    let currentNumbersLang = Object.keys(currentNumbers).splice(1)
    let currentNumbersValue = Object.values(currentNumbers).splice(1)

    currentNumbersLang.forEach((langCode, i) => {
        if (totalLangs.indexOf(langCode) !== -1) {
            // If language code key of this year exists add it up to include the previous years.
            return total[langCode] = total[langCode] + currentNumbers[langCode]
        } else if (total[langCode] === undefined) {
            // Undefined = create this langCode in the new total object
            return total[langCode] = currentNumbersValue[i]
        }
    })

    // Store the previous years data in the currentNumbers to add up for the next years loop. (accumulating)
    currentNumbers = total
    return currentNumbers
}

getStandard = (year, data) => {
    // This function creates per given year, from the for loop, an object which sorts out all the languages, languages that are translated get a double language code f.e english to dutch = engdut.
    let total = {
        year: year,
    }

    let langCodes = []
    data.forEach(book => {
        if (Number(book.pubYear) === year) {
            let lang = book.language === null ? 'nolang' : book.language
            let origin = book.originLang === null ? '' : book.originLang
            lang === origin ? origin = '' : false

            langCodes.push(origin + lang)
        }
    })

    langCodes.forEach(langCode => {
        return !total[langCode] ? (total[langCode] = 1) : total[langCode]++
    })
    
    return total
}

formData = (data) => {
    let cumulativeData = []
    let standardData = []

    for (let i = 1900; i <= 2018; i++) {
        cumulativeData.push(getCumulative(i, data))
        standardData.push(getStandard(i, data))
    }

    state.cumulativeData = cumulativeData
    state.standardData = standardData
    renderGraph()
}

fetch('all.json')
    .then(res => res.json()
        .then(data => {
            console.log(data.length)
            formData(data)
        })
    )
    .catch(err => {
        console.log(err)
        chartDiv.innerHTML = 'Sorry cannot find the data :('
    })