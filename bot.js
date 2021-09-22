const Discord = require("discord.js");
const ical = require('node-ical');
const ADE = ical.sync.parseFile('MDS.ics');
const Client = new Discord.Client();

const dotenv = require('dotenv');
dotenv.config()

const token = process.env.TOKEN;
/* https://discord.com/oauth2/authorize?client_id=565499644528820236&scope=bot&permissions=9999 */
var rappel = new Date();
var today = new Date();
var tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

rappel.setHours(20);

function checkDates(d1, d2) {
	if(d1.getDate() == d2.getDate() && d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear()) {
		return true;
	} else {
		return false;
	}
}

function time(d1, d2) {
	if(SERVERS.length > 0) {
		if(	d1.getDate() == d2.getDate() && d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear() && d1.getHours() == d2.getHours()) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

function searchADE(tomorrow, message = null) {
	var cours = [];

	for (const event of Object.values(ADE)) {

		let dateEventStart = new Date(event.start)

		if(checkDates(tomorrow, dateEventStart)) {
			cours.push(event)
		}
	};

	if(cours.length > 0) {
		displayCours(cours, message);
	} else {
		displayNone(message);
	}
}

function searchWithDate(date, message) {
	var cours = [];
	let dateFR = date.split('/')
	let dateValue = new Date(today)
	dateValue.setMonth(dateFR[1]-1)
	dateValue.setFullYear(dateFR[2])
	dateValue.setDate(dateFR[0])

	for (const event of Object.values(ADE)) {
		let dateEventStart = new Date(event.start)

		if(checkDates(dateValue, dateEventStart)) {
			cours.push(event)
		}
	};

	if(cours.length > 0) {
		displayCours(cours, message);
	} else {
		displayNone(message);
	}
}

function displayNone(message) {
	const courMsg = new Discord.MessageEmbed()
	.setColor('#FF3636')
	.setTitle('Aucun cours')
	
	if(message == null) {
		for(let i = 0 ; i<SERVERS.length ; i++) {
			Client.channels.cache.get(SERVERS[i][1]).send(courMsg);
		}
	} else {
		message.channel.send(courMsg);	
	}
}

const DAYS = [
	'',
	'Lundi',
	'Mardi',
	'Mercredi',
	'Jeudi',
	'Vendredi',
	'Samedi',
	'Dimanche'
]

const MONTHS = [
	'Janvier',
	'Fevrier',
	'Mars',
	'Avril',
	'Mai',
	'Juin',
	'Juillet',
	'Aout',
	'Septembre',
	'Octobre',
	'Novembre',
	'Decembre'
]

var SERVERS = [];

function displayCours(tab, message) {
	
	if(tab.length > 1) {
		if(tab[0].start.getHours() > tab[1].start.getHours()) {
			var temp = tab[0];
			tab[0] = tab[1];
			tab[1] = temp;
		}
	}
	
	var courMsg = new Discord.MessageEmbed()
		.setColor('#366AFF')
		.setTitle(DAYS[new Date(tab[0].start).getDay()] + ' ' + new Date(tab[0].start).getDate() + ' ' + MONTHS[new Date(tab[0].start).getMonth()] + ' ' + new Date(tab[0].start).getFullYear())
	
	if(message == null) {
		for(let i = 0 ; i<SERVERS.length ; i++) {
			Client.channels.cache.get(SERVERS[i][1]).send(courMsg);
		}
	} else {
		message.channel.send(courMsg);	
	}

	//for(let event of tab) {

		//console.log(event)

		var courMsg = new Discord.MessageEmbed()
			.setColor('#FF3636')
			//.setTitle(event.description.val)
			.setDescription(

				embedMessage(tab)

			)
			//.setFooter("Salle " + event.location.val);
		
		if(message == null) {	
			for(let i = 0 ; i<SERVERS.length ; i++) {
				Client.channels.cache.get(SERVERS[i][1]).send(courMsg);
			}
		} else {
			message.channel.send(courMsg);	
		}
	//}

}

function embedMessage(cours) {
	var str = ""
	for(let event of cours) {

		let dateEventStart = new Date(event.start)
		let dateEventEnd = new Date(event.end)

		str += '**🕔 '+dateEventStart.getHours() + ':' + ('0' + dateEventStart.getMinutes()).slice(-2) + ' - ' + dateEventEnd.getHours() + ':' + ('0' + dateEventEnd.getMinutes()).slice(-2)+'**\n\n'
		str += event.description.val + "\n"
		str += "*🚪 Salle " + event.location.val + "*"

		str += "\n\n————————————————————\n\n"
	}

	return str
}

function startCounting() {
	setInterval(() => {
		
		today = new Date();
		tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)
		
		if(time(today, rappel)) {
			searchADE(tomorrow);
			rappel.setDate(rappel.getDate() + 1)
		}
	},1000)
}


 Client.on("ready", () => {
	console.log("• Connected •");
});


Client.on('message', message => {

if (message.content === '.channelSet'){
	let servId = message.guild.id;
	let cId = message.channel.id;
	let newServ = true;

	for(let i =0; i<SERVERS.length;i++) {
		if(SERVERS[i][0] == servId) {
			SERVERS[i][1] = cId; 
			newServ = false;
		}
	}

	if(newServ) {
		SERVERS.push([servId, cId]);
	}

	message.channel.send('Channel mis à jour')
	startCounting();
}

else if (message.content === '.help') {
	var configMsg = new Discord.MessageEmbed()
		.setColor('#FF3636')
		.setTitle('BOT EDT DIM')
		.setDescription('Le BOT affiche l\'emploie du temps tous les soirs a 20h.\n\n\nPour pouvoir afficher l\'emploie du temps, marquer dans le chat\n\n```.channelSet```' +
		'\n\n\nPour voir l\'EDT directement, taper\n```.edt```\n\n\nPour voir l\'EDT a une date précise, taper\n```.edt JJ/MM/AAAA```\n\n\nPour voir l\'EDT de demain, taper\n```.demain```')
		.setFooter('LP DIM');

	message.channel.send(configMsg);
}

else if (message.content === '.edt') {
	if(SERVERS.length > 0) {
		searchADE(today, message)
	}
}

else if (message.content.startsWith('.edt')){
	let date = message.content.substr(5)
	if(date.length != 10) {
		message.reply('La date n\'est pas bonne')
	} else {
		searchWithDate(date, message)
	}
}

else if (message.content === '.demain') {
	if(SERVERS.length > 0) {
		searchADE(tomorrow, message)
	}
}

else if (message.content.startsWith('.setHours')){
	let h = message.content.substr(10)
	rappel.setHours(h);
}

});

Client.login(token)

