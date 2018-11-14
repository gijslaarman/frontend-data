// Create state for window
const selectLanguage = document.getElementById('translation')
const selectTranslation = document.getElementById('language')
const selectMinYear = document.getElementById('minYear')
const selectMaxYear = document.getElementById('maxYear')

window.state = {
    minYear: Number(selectMinYear.value),
    maxYear: Number(selectMaxYear.value),
    language: selectLanguage.value,
    translation: selectTranslation.value
}
let state = window.state

changeYear = () => {
    state.minYear = Number(selectMinYear.value)
    state.maxYear = Number(selectMaxYear.value)
    changeData()
}

changeLanguage = () => {
    state.language = selectLanguage.value
    state.translation = selectTranslation.value
    changeData()
}

selectMinYear.addEventListener('change', changeYear)
selectMaxYear.addEventListener('change', changeYear)
selectLanguage.addEventListener('change', changeLanguage)
selectTranslation.addEventListener('change', changeLanguage)

changeData = () => {
    fetch('http://localhost:8080/api')
    .then(res => res.json()
        .then(data => {
            makeGraph(data)
        })
    )
}

makeGraph = data => {
    data = getLanguages(data)

    const margin = {top: 50, right: 50, bottom: 50, left: 50},
          width = 1400 - margin.left - margin.right,
          height = 550 - margin.top - margin.bottom

    d3.select('svg').remove()

    const chart = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    let x = d3.scaleBand().range([0, width]).padding(.3)
    let y = d3.scaleLinear().range([height, 0])

    
    console.log(data)

    x.domain(data.map(d => d.year))
    y.domain([0, d3.max(data.map(d => d.amount))])

    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .attr('class', 'text x-axis')
        .call(d3.axisBottom(x))

    chart.append('g')
        .attr('class', 'text')
        .call(d3.axisLeft(y))

    chart.selectAll(".bar")
        .data(data)
    .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.year)})
        .attr("y", function(d) { return y(d.amount)})
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.amount) })


    // chart.selectAll("text.bar")
    //     .data(data)
    //   .enter().append("text")
    //     .attr("class", "bar")
    //     .attr("text-anchor", "middle")
    //     .attr('x', d => x(d.year) + x.bandwidth() - 12)
    //     .attr('y', d => y(d['dut'] - 5))
    //     .text(d => d['dut'])
}

changeData()

getLanguages = (data) => {
    const books = []
    let translation = state.translation === state.language ? null : state.translation

    data.forEach(book => {
        if (book.language === state.language && book.originLang === translation) {
            return books.push(book)
        } else if (book.language === state.language && book.originLang === state.translation) {
            return books.push(book)
        }
    })

    return sortBooksByYear(books);
}

sortBooksByYear = (array) => {
    let data = [];

    for (let i = state.minYear; i <= state.maxYear; i++) {
        console.log(i)
        let bookArray = [];

        array.forEach(book => {
            if (Number(book.pubYear) === i) {
                bookArray.push(book)
            }
        })

        data.push({
            year: i,
            amount: bookArray.length
        })
    }

    return data
}
