document.addEventListener('DOMContentLoaded', () => {
    const tariffCalculatorForm = document.getElementById('tariffCalculatorForm');
    const tariffSettingsForm = document.getElementById('tariffSettingsForm');
    const prenotazioneForm = document.getElementById('prenotazioneForm');
    const appuntamentoForm = document.getElementById('appuntamentoForm');
    const listaPrenotazioni = document.querySelector('#listaPrenotazioni tbody');
    const listaAppuntamenti = document.getElementById('listaAppuntamenti');
    const nextAppointment = document.getElementById('nextAppointment');
    const numPrenotazioni = document.getElementById('numPrenotazioni');
    const numClienti = document.getElementById('numClienti');
    const numAnimali = document.getElementById('numAnimali');
    const entrateTotali = document.getElementById('entrateTotali');
    const calculatedCost = document.getElementById('calculatedCost');

    const getTariffe = () => {
        return JSON.parse(localStorage.getItem('tariffe')) || { cani: 22, gatti: 10 };
    };

    const setTariffe = (tariffe) => {
        localStorage.setItem('tariffe', JSON.stringify(tariffe));
    };

    tariffSettingsForm && tariffSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tariffe = {
            cani: parseFloat(e.target.tariffaCani.value),
            gatti: parseFloat(e.target.tariffaGatti.value),
        };
        setTariffe(tariffe);
        alert('Tariffe salvate!');
    });

    tariffCalculatorForm && tariffCalculatorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const arrivo = new Date(e.target.arrivo.value);
        const partenza = new Date(e.target.partenza.value);
        const numCani = parseInt(e.target.numCani.value);
        const numGatti = parseInt(e.target.numGatti.value);

        const diffOre = (partenza - arrivo) / 1000 / 60 / 60;
        const blocchi4Ore = Math.ceil(diffOre / 4);

        const tariffe = getTariffe();
        const costoCani = (tariffe.cani / 6) * blocchi4Ore * numCani;
        const costoGatti = (tariffe.gatti / 6) * blocchi4Ore * numGatti;
        const costoTotale = Math.round((costoCani + costoGatti) / 5) * 5;

        calculatedCost.textContent = `Costo Totale: ${costoTotale}€`;
    });

    prenotazioneForm && prenotazioneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const prenotazione = {
            cliente: e.target.cliente.value,
            animale: e.target.animale.value,
            tipo: e.target.tipo.value,
            arrivo: e.target.arrivo.value,
            partenza: e.target.partenza.value,
            note: e.target.note.value
        };

        let prenotazioni = JSON.parse(localStorage.getItem('prenotazioni')) || [];
        prenotazioni.push(prenotazione);
        localStorage.setItem('prenotazioni', JSON.stringify(prenotazioni));

        displayPrenotazioni();
    });

    const displayPrenotazioni = () => {
        let prenotazioni = JSON.parse(localStorage.getItem('prenotazioni')) || [];
        listaPrenotazioni.innerHTML = '';
        prenotazioni.forEach((prenotazione, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${prenotazione.cliente}</td>
                <td>${prenotazione.animale}</td>
                <td>${prenotazione.tipo}</td>
                <td>${prenotazione.arrivo}</td>
                <td>${prenotazione.partenza}</td>
                <td>${prenotazione.note}</td>
                <td>
                    <button onclick="editPrenotazione(${index})">Modifica</button>
                    <button onclick="deletePrenotazione(${index})">Elimina</button>
                </td>
            `;
            listaPrenotazioni.appendChild(row);
        });
    };

    const editPrenotazione = (index) => {
        let prenotazioni = JSON.parse(localStorage.getItem('prenotazioni')) || [];
        const prenotazione = prenotazioni[index];
        const cliente = prompt('Modifica Cliente:', prenotazione.cliente);
        const animale = prompt('Modifica Animale:', prenotazione.animale);
        const tipo = prompt('Modifica Tipo:', prenotazione.tipo);
        const arrivo = prompt('Modifica Arrivo:', prenotazione.arrivo);
        const partenza = prompt('Modifica Partenza:', prenotazione.partenza);
        const note = prompt('Modifica Note:', prenotazione.note);

        if (cliente && animale && tipo && arrivo && partenza && note !== null) {
            prenotazioni[index] = { cliente, animale, tipo, arrivo, partenza, note };
            localStorage.setItem('prenotazioni', JSON.stringify(prenotazioni));
            displayPrenotazioni();
        }
    };

    const deletePrenotazione = (index) => {
        let prenotazioni = JSON.parse(localStorage.getItem('prenotazioni')) || [];
        prenotazioni.splice(index, 1);
        localStorage.setItem('prenotazioni', JSON.stringify(prenotazioni));
        displayPrenotazioni();
    };

    appuntamentoForm && appuntamentoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const appuntamento = {
            proprietario: e.target.proprietario.value,
            dataOra: e.target.dataOra.value,
            note: e.target.note.value
        };

        let appuntamenti = JSON.parse(localStorage.getItem('appuntamenti')) || [];
        appuntamenti.push(appuntamento);
        localStorage.setItem('appuntamenti', JSON.stringify(appuntamenti));

        displayAppuntamenti();
    });

    const displayAppuntamenti = () => {
        let appuntamenti = JSON.parse(localStorage.getItem('appuntamenti')) || [];
        listaAppuntamenti.innerHTML = '';
        appuntamenti.forEach((appuntamento, index) => {
            const li = document.createElement('li');
            li.textContent = `Proprietario: ${appuntamento.proprietario}, Data e Ora: ${appuntamento.dataOra}, Note: ${appuntamento.note}`;
            listaAppuntamenti.appendChild(li);
        });

        if (nextAppointment) {
            const prossimoAppuntamento = appuntamenti.sort((a, b) => new Date(a.dataOra) - new Date(b.dataOra))[0];
            nextAppointment.textContent = prossimoAppuntamento ? `Prossimo Appuntamento: ${prossimoAppuntamento.proprietario} il ${prossimoAppuntamento.dataOra}` : 'Nessun appuntamento imminente';
        }
    };

    const displayStatistiche = () => {
        let prenotazioni = JSON.parse(localStorage.getItem('prenotazioni')) || [];
        let clienti = new Set(prenotazioni.map(p => p.cliente)).size;
        let animali = new Set(prenotazioni.map(p => p.animale)).size;
        let entrate = prenotazioni.reduce((total, p) => {
            const arrivo = new Date(p.arrivo);
            const partenza = new Date(p.partenza);
            const diffOre = (partenza - arrivo) / 1000 / 60 / 60;
            const blocchi4Ore = Math.ceil(diffOre / 4);
            const tariffe = getTariffe();
            const costoCani = (tariffe.cani / 6) * blocchi4Ore;
            const costoGatti = (tariffe.gatti / 6) * blocchi4Ore;
            return total + Math.round((costoCani + costoGatti) / 5) * 5;
        }, 0);

        numPrenotazioni && (numPrenotazioni.textContent = prenotazioni.length);
        numClienti && (numClienti.textContent = clienti);
        numAnimali && (numAnimali.textContent = animali);
        entrateTotali && (entrateTotali.textContent = `${entrate}€`);
    };

    displayPrenotazioni();
    displayAppuntamenti();
    displayStatistiche();
});
