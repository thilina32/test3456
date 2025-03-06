const fs = require('fs');
const path = require('path');
const pino = require('pino');
const {
  default: makeWASocket,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  useMultiFileAuthState,
  proto,
} = require('@whiskeysockets/baileys');


let socket;

async function connectWhatsApp() {
    const auth = await useMultiFileAuthState('session');
    socket = makeWASocket({
        printQRInTerminal: true,
        browser: ["SHAN_AI_2v", 'safari', "1.0.0"],
        auth: auth.state,
        logger: pino({ level: 'silent' })
    });

    socket.ev.on('creds.update', auth.saveCreds);

    socket.ev.on('connection.update', async ({ connection }) => {
        if (connection === 'open') {
            await socket.sendMessage('94719036042@s.whatsapp.net', { text: "\n\nBot is connected👋\n\n" });
            socket.sendButtonProto('94719036042@s.whatsapp.net',"hi", "h","h")
            console.log('Bot started successfully.');
           
        } else if (connection === 'close') {
            console.log('Connection lost, reconnecting...');
            await connectWhatsApp();
        }
    });

    socket.ev.on('messages.upsert', async ({ messages }) => {
        try {
            messages.forEach( async (m) => {
                console.log(m)
                if((m.message?.extendedTextMessage?.text || m.message?.conversation || "").toLowerCase() === "send") {
                    
                    const interactiveButtons = [
                        {
                           name: "quick_reply",
                           buttonParamsJson: JSON.stringify({
                                display_text: "Quick Reply",
                                id: "ID"
                           })
                        },
                        {
                           name: "cta_url",
                           buttonParamsJson: JSON.stringify({
                                display_text: "Tap Here!",
                                url: "https://www.example.com/"
                           })
                        },
                        {
                           name: "cta_copy",
                           buttonParamsJson: JSON.stringify({
                                display_text: "Copy Code",
                                id: "12345",
                                copy_code: "12345"
                           })
                        }
                   ]
                    const buttons = [
                        { buttonId: 'id1', buttonText: { displayText: 'Button 1' }, type: 1 },
                        { buttonId: 'id2', buttonText: { displayText: 'Button 2' }, type: 1 },
                      ]
                      
                      const buttonMessage = {
                          text: "Hi it's button message",
                          footer: 'Hello World',
                          buttons,
                          headerType: 1,
                          viewOnce: true
                      }
                      
                      await socket.sendMessage('94719036042@s.whatsapp.net', buttonMessage, { quoted: null })
                    
                socket.sendButtonProto('94719036042@s.whatsapp.net',"hi", "h","h",m)
            }
            });
        } catch (error) {
            console.error('An error occurred:', error);
        }
    });
    socket.sendButtonProto = async (jid, title, footer, buttons = [], quoted = '', options = {}) => {
        let msg = generateWAMessageFromContent(jid, {
            viewOnceMessage: {
                message: {
                    "messageContextInfo": {
                        "deviceListMetadata": {},
                        "deviceListMetadataVersion": 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        ...options,
                        body: proto.Message.InteractiveMessage.Body.create({ text: title }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: footer || "puqi" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    "name": 'quick_reply',
                                    "buttonParamsJson": `{"display_text":"hi","id":".button"}`
                                }
                            ]
                        })
                    })
                }
            }
        }, { quoted })
        return await socket.relayMessage(msg.key.remoteJid, msg.message, {
            messageId: msg.key.id
        })
        
    }

    socket.react = async (m, r) => {
        try {
            const reactionMessage = {
                react: {
                    text: r,
                    key: m.key,
                },
            };
            return await socket.sendMessage(m.key.remoteJid, reactionMessage);
        } catch (error) {
            console.error('Failed to send reaction:', error);
        }
    };
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    socket.prepareWAMessageMedia = function (message, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, prepareWAMessageMedia)(message, options);
        });
    }
    socket.sendInteractiveMessage = async (jid,m) => { 
        constecre = {
                  "body": { "text": m.body || "" },
                  "footer": { "text": m.footer || "" },
                  "carouselMessage": m.carouselMessage
                }
        
        
                let msg = (0, generateWAMessageFromContent)(jid, {
                    viewOnceMessage: {
                        message: {
                            "messageContextInfo": {
                                "deviceListMetadata": {},
                                "deviceListMetadataVersion": 2
                            },
                            interactiveMessage: proto.Message.InteractiveMessage.create(constecre)
                        }
                    }
                },{"timestamp":new Date()});
                
                return socket.relayMessage(jid, msg.message, {
                    messageId: msg.key.id
                });
    };
}

connectWhatsApp().catch((error) => {
    console.error('Error starting WhatsApp bot:', error);
});
