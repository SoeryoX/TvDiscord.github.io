const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const express = require('express');
const puppeteer = require('puppeteer');
const os = require('os');

// Konfigurasi yang dapat diubah
const CONFIG = {
  PORT: process.env.PORT || 3001,
  DISCORD_TOKEN: 'BOT_TOKEN', // Ganti dengan token Discord And
  WEBSITE_URL: 'https://paimm13.github.io/RemoteTV.github.io/',
  PREFIX: '!tv'
};

// Inisialisasi Express Server
const app = express();
app.use(express.json());
app.use(require('cors')());

// Inisialisasi Discord Bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Channel list dengan detail dan gambar
const TV_CHANNELS = [
  {
    name: 'rcti',
    description: 'media nusantara citra TV',
    apiId: 'rcti', // ID untuk API Tivie.id
    switchCommand: 'switchTo1()',
    isLive: true
  },
  {
    name: 'mnctv',
    description: 'mnctv',
    apiId: 'mntcv', // ID untuk API Tivie.id
    switchCommand: 'switchTo2()',
    isLive: true
  },
  {
    name: 'gtv',
    description: 'gtv',
    apiId: 'gtv', // ID untuk API Tivie.id
    switchCommand: 'switchTo3()',
    isLive: true
  },
  {
    name: 'transtv',
    description: 'transtv',
    apiId: 'transtv', // ID untuk API Tivie.id
    switchCommand: 'switchTo4()',
    isLive: true
  },
  {
    name: 'trans7',
    description: 'trans7',
    apiId: 'trans7', // ID untuk API Tivie.id
    switchCommand: 'switchTo5()',
    isLive: true
  },
  {
    name: 'mdtv',
    description: 'mdtv',
    apiId: 'mdtv', // ID untuk API Tivie.id
    switchCommand: 'switchTo6()',
    isLive: true
  },
  {
    name: 'sctv',
    description: 'sctv',
    apiId: 'sctv', // ID untuk API Tivie.id
    switchCommand: 'switchTo7()',
    isLive: true
  },
  {
    name: 'mojitv',
    description: 'mojitv',
    apiId: 'moji', // ID untuk API Tivie.id
    switchCommand: 'switchTo8()',
    isLive: true
  },
  {
    name: 'indosiar',
    description: 'indosiar',
    apiId: 'indosiar', // ID untuk API Tivie.id
    switchCommand: 'switchTo9()',
    isLive: true
  },
  {
    name: 'mentari',
    description: 'mentari',
    apiId: 'mentari', // ID untuk API Tivie.id
    switchCommand: 'switchTo10()',
    isLive: true
  },
  {
    name: 'cnn',
    description: 'cnn',
    apiId: 'cnn', // ID untuk API Tivie.id
    switchCommand: 'switchTo11()',
    isLive: true
  },
  {
    name: 'animax',
    description: 'animax',
    apiId: 'animax', // ID untuk API Tivie.id
    switchCommand: 'switchTo12()',
    isLive: true
  },
  {
    name: 'cartoon',
    description: 'cartoon',
    apiId: 'cartoon', // ID untuk API Tivie.id
    switchCommand: 'switchTo13()',
    isLive: true
  },
  {
    name: 'tvone',
    description: 'tvone',
    apiId: 'tvone', // ID untuk API Tivie.id
    switchCommand: 'switchTo14()',
    isLive: true
  },
  {
    name: 'Hbo asia',
    description: 'habo asia',
    apiId: 'hboasia', // ID untuk API Tivie.id
    switchCommand: 'switchTo15()',
    isLive: true
  },{
    name: 'hbo hits',
    description: 'hbo hits',
    apiId: 'hbo hits', // ID untuk API Tivie.id
    switchCommand: 'switchTo16()',
    isLive: true
  },
  {
    name: 'hbo family',
    description: 'habo family',
    apiId: 'hbo family', // ID untuk API Tivie.id
    switchCommand: 'switchTo17()',
    isLive: true
  },
  {
    name: 'cinemax',
    description: 'cinemax',
    apiId: 'cinemax', // ID untuk API Tivie.id
    switchCommand: 'switchTo18()',
    isLive: true
  },
  {
    name: 'aniplus',
    description: 'aniplus',
    apiId: 'aniplus', // ID untuk API Tivie.id
    switchCommand: 'switchTo19()',
    isLive: true
  },
  {
    name: 'bein 1',
    description: 'bein 1',
    apiId: 'bein1', // ID untuk API Tivie.id
    switchCommand: 'switchTo20()',
    isLive: true
  },
  {
    name: 'bein 2',
    description: 'bein 2',
    apiId: 'bein 2', // ID untuk API Tivie.id
    switchCommand: 'switchTo21()',
    isLive: true
  },
  {
    name: 'bein 3',
    description: 'bein 3',
    apiId: 'bein 3', // ID untuk API Tivie.id
    switchCommand: 'switchTo22()',
    isLive: true
  },
  {
    name: 'tvn movies',
    description: '',
    apiId: 'tvnmovies', // ID untuk API Tivie.id
    switchCommand: 'switchTo23()',
    isLive: true
  },
  {
    name: 'rtv',
    description: 'raja wali tv',
    apiId: 'rtv', // ID untuk API Tivie.id
    switchCommand: 'switchTo24()',
    isLive: true
  },
  // Tambahkan channel lainnya
];

// Puppeteer Variables
let browser;
let page;
let browserStarted = false;

// Function untuk mendapatkan path Chrome berdasarkan OS
function getChromeExecutablePath() {
  const platform = os.platform();
  if (platform === 'win32') {
    // Windows path
    return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  } else if (platform === 'darwin') {
    // macOS path
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  } else {
    // Linux path
    return '/usr/bin/chromium';
  }
}

// Function untuk memulai browser
async function startBrowser(url) {
  try {
    console.log(`Attempting to start browser with URL: ${url}`);
    const chromePath = getChromeExecutablePath();
    
    browser = await puppeteer.launch({
      headless: false,
      executablePath: chromePath,
      args: [
        '--disable-web-security',
        '--enable-widevine',
        '--disable-gpu',
        '--autoplay-policy=no-user-gesture-required',
        '--disable-blink-features=AutomationControlled',
        '--kiosk'

      ],
      defaultViewport: null
    });

    const pages = await browser.pages();
    page = pages.length > 0 ? pages[0] : await browser.newPage();
    
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    
    console.log(`Loading ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    console.log('Page loaded successfully. Browser is ready.');
    browserStarted = true;
    return true;
  } catch (error) {
    console.error(`Error starting browser: ${error.message}`);
    return false;
  }
}

// Function untuk mengambil data program TV dari API Tivie.id
async function getCurrentProgram(channelId) {
  try {
    const response = await axios.get(`https://tivie.id/api/channel?id=${channelId}`);
    const data = response.data;

    if (data && data.play) {
      return {
        title: data.play.title,
        description: data.play.desc,
        image: data.play.image,
        isLive: data.play.live === 1,
        nextProgram: data.next[0]?.title || 'Tidak ada info program berikutnya'
      };
    } else {
      return {
        title: 'Tidak ada info program',
        description: 'Tidak ada deskripsi',
        image: 'https://via.placeholder.com/400x200.png?text=No+Image+Available',
        isLive: false,
        nextProgram: 'Tidak ada info program berikutnya'
      };
    }
  } catch (error) {
    console.error(`Error fetching program for ${channelId}:`, error.message);
    return {
      title: 'Error mengambil data',
      description: 'Terjadi kesalahan saat mengambil data program.',
      image: 'https://via.placeholder.com/400x200.png?text=Error+Loading+Image',
      isLive: false,
      nextProgram: 'Tidak ada info program berikutnya'
    };
  }
}

// Function untuk mendapatkan info jadwal acara saat ini
const getCurrentPrograms = async () => {
  const programs = {};
  
  for (const channel of TV_CHANNELS) {
    const program = await getCurrentProgram(channel.apiId);
    programs[channel.name] = program;
  }
  
  return programs;
};

// Function untuk mendapatkan channel berdasarkan nama
const getChannelByName = (name) => {
  return TV_CHANNELS.find(channel => 
    channel.name.toLowerCase() === name.toLowerCase());
};

// Function untuk eksekusi perintah JavaScript di browser
async function executeInBrowser(command) {
  if (!browserStarted || !page) {
    console.error('Browser not started yet!');
    return false;
  }
  
  try {
    console.log(`Executing command: ${command}`);
    await page.evaluate(command);
    return true;
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    return false;
  }
}

// Function to handle browser start/restart
async function handleBrowserStart(message) {
  const statusMsg = await message.channel.send('⏳ Memulai browser TV...');
  
  // Close existing browser if it's open
  if (browser) {
    try {
      await browser.close();
      browserStarted = false;
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }
  
  // Start browser
  const success = await startBrowser(CONFIG.WEBSITE_URL);
  
  if (success) {
    await statusMsg.edit('✅ Browser TV berhasil dimulai! Anda dapat menggunakan bot sekarang.');
  } else {
    await statusMsg.edit('❌ Gagal memulai browser TV. Cek log server untuk detail.');
  }
}

// Event when bot is ready
client.once('ready', () => {
  console.log(`Bot is online! Logged in as ${client.user.tag}`);
  client.user.setActivity('TV Indonesia', { type: 'WATCHING' });
});

// Handle message events
client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Check if message mentions the bot
  if (message.mentions.has(client.user)) {
    const content = message.content.trim();
    const args = content.split(' ');
    
    // If just mentioned with no command, show TV guide
    if (args.length === 1) {
      return showTVGuide(message);
    }
    
    // Check for browser restart command
    if (args[1].toLowerCase() === 'start' || args[1].toLowerCase() === 'restart') {
      return handleBrowserStart(message);
    }
    
    // Get channel name from command
    const channelName = args[1].toUpperCase();
    const channel = getChannelByName(channelName);
    
    if (channel) {
      await switchChannel(message, channel);
    } else {
      message.reply(`Channel TV '${channelName}' tidak ditemukan. Ketik !tv untuk melihat daftar channel.`);
    }
    return;
  }
  
  // Check for prefix command
  if (!message.content.startsWith(CONFIG.PREFIX)) return;
  
  const args = message.content.slice(CONFIG.PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  if (command === '') {
    // Show TV guide if just prefix
    await showTVGuide(message);
  } else if (command === 'start' || command === 'restart') {
    await handleBrowserStart(message);
  } else {
    // Get channel
    const channel = getChannelByName(command);
    
    if (channel) {
      await switchChannel(message, channel);
    } else {
      message.reply(`Channel TV '${command}' tidak ditemukan. Ketik !tv untuk melihat daftar channel.`);
    }
  }
});

// Function to show TV guide
async function showTVGuide(message) {
  const currentPrograms = await getCurrentPrograms();
  
  const embed = new EmbedBuilder()
    .setTitle('📺 JADWAL TV INDONESIA')
    .setDescription('Berikut adalah daftar channel TV yang tersedia. Mention bot dengan nama channel untuk menonton.\nContoh: `@TVRemoteBot GTV`')
    .setColor('#3498db')
    .setTimestamp();
  
  TV_CHANNELS.forEach(channel => {
    const program = currentPrograms[channel.name];
    const statusEmoji = program.isLive ? '🟢 LIVE' : '⚫ OFF';
    
    embed.addFields({
      name: `${channel.name.toUpperCase()} - ${statusEmoji}`,
      value: `**Program Saat Ini:** ${program.title}\n**Deskripsi:** ${program.description}\n**Program Berikutnya:** ${program.nextProgram}`,
      inline: false
    });
  });
  
  embed.setFooter({ 
    text: 'Terakhir diperbarui', 
    iconURL: 'https://i.imgur.com/AfFp7pu.png' 
  });
  
  await message.channel.send({ embeds: [embed] });
}

// Function to switch channel
async function switchChannel(message, channel) {
  if (!browserStarted) {
    return message.reply('❌ Browser TV belum dimulai. Gunakan `!tv start` untuk memulai browser.');
  }
  
  const currentPrograms = await getCurrentPrograms();
  const program = currentPrograms[channel.name];
  
  // Status pesan awal
  const statusMsg = await message.channel.send(`⏳ Sedang beralih ke channel ${channel.name}...`);
  
  // Eksekusi perintah di browser melalui Puppeteer
  const success = await executeInBrowser(channel.switchCommand);
  
  // Tambahkan perintah untuk unmute volume setelah beralih channel
  await executeInBrowser('document.querySelector("video").muted = false;'); // Pastikan untuk menyesuaikan selector jika perlu
  
  if (success) {
    const embed = new EmbedBuilder()
      .setTitle(`📺 Berhasil beralih ke ${channel.name.toUpperCase()}`)
      .setDescription(`**Sedang menonton:** ${program.title}\n**Deskripsi:** ${program.description}\n\n**Program berikutnya:** ${program.nextProgram}`)
      .setColor('#2ecc71')
      .setImage(program.image)
      .setTimestamp()
      .setFooter({ 
        text: `Elimchi Server`, 
        iconURL: 'https://i.imgur.com/CVMXv6L.png'
      });
    
    await statusMsg.edit({ 
      content: `✅ <@${message.author.id}> sekarang menonton ${channel.name.toUpperCase()}`,
      embeds: [embed] 
    });
  } else {
    await statusMsg.edit(`❌ Gagal beralih ke channel ${channel.name}. Browser mungkin telah ditutup atau error.`);
  }
}

// Function to start the application
async function startApp() {
  try {
    // Start Express server
    app.listen(CONFIG.PORT, async () => {
      console.log(`🚀 API listening on http://localhost:${CONFIG.PORT}`);
      
      // Log in to Discord
      try {
        await client.login(CONFIG.DISCORD_TOKEN);
        console.log('Discord bot logged in successfully');
      } catch (error) {
        console.error('Failed to log in to Discord:', error);
      }
    });
  } catch (error) {
    console.error('Error starting application:', error);
  }
}

// Add a status endpoint
app.get('/status', (req, res) => {
  res.json({
    botOnline: client.isReady() || false,
    browserStarted,
    port: CONFIG.PORT,
    channels: TV_CHANNELS.map(c => c.name)
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  
  if (browser) {
    await browser.close();
  }
  
  process.exit(0);
});

// Start the application
startApp();
