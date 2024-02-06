const Discord = require("discord.js");
const request = require("request");
const {
  Intents,
  Client,
  MessageActionRow,//使用してません
  MessageButton,//使用してません
  ClientApplication,
} = require("discord.js");
const options = {
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",//使用してません
    "GUILD_VOICE_STATES",//使用してません
    "GUILD_WEBHOOKS",
  ],
};
const cacheWebhooks = new Map();
const commands = [
    {
      name: "ping",
      description: "ping値を返します。",
    },
    {
      name: "automatictranslation",
      description: "コマンドが送信されたチャンネルで自動翻訳を開始/停止します。",
    },
  ];
const fs = require("fs");
const client = new Discord.Client(options);
const prefix = "";//prefix自分で入れてね
const fetch = require("node-fetch");
const cash = new Object();
const trmsgid = new Object();
var packagejson = require("./package.json");
var settings = require("./settings.json");
cash.trst = settings.trst
cash.msgch = settings.msgch
client.on("ready", async () => {
  console.log(client.user.tag + "にログインしました");
  client.user.setPresence({
    status: "online",
  });
  client.user.setActivity(
    `ver ${packagejson.version} | d.js : ${packagejson.dependencies["discord.js"].replace("^", "")},wake up time : ${Date.now()}`,
    { type: "PLAYING" }
  );
  await client.application.commands.set(commands);//スラッシュコマンドの登録
});

client.on("messageCreate", async (message) => {
  var args = message.content.slice(prefix.length).trim().split(/ +/g);
  var command = args.shift().toLowerCase();
  if(message.author.bot) return;//botのメッセージに反応しない。消してもいいけど永遠に翻訳ループする可能性があるので注意
  if (command === 'tr') { //コマンドで手動翻訳
     var target = encodeURIComponent(args[0])
     var text = encodeURIComponent(message.content.replace(args[0],"").replace(prefix+"tr",""))
     var content = await fetch(`https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec?text=${text}&source=&target=${target}`).then(res => res.text())
     message.channel.send({
      embeds: [
        {
          author: {
            name: message.author.displayName,
          },
          title: content,
          footer: {
            text: `to : ${args[0]}`,
          },
        },
      ],
     })
  }
    if(command==="start"){
      if(cash["trst"]===1){
        return message.reply(`この機能は https://discord.com/channels/${message.guild.id}/${cash["msgch"]} で利用されています。`)
      }
      var FilePath = "./settings.json";
      var Structure = JSON.parse(fs.readFileSync(FilePath));
      Structure["trst"] = 1;
      Structure["msgch"] = message.channel.id
      fs.writeFileSync(FilePath, JSON.stringify(Structure));
      cash["trst"]=1
      cash["msgch"]=message.channel.id
      return message.reply("enable automatic translation")
    }
    if(command==="stop"){
      if(cash["trst"]===0){
        return message.reply(`Already disabled`)
      }
      if(cash["trst"]===undefined){
        return message.reply(`Already disabled`)
      }
      var FilePath = "./settings.json";
      var Structure = JSON.parse(fs.readFileSync(FilePath));
      Structure["trst"] = 0;
      Structure["msgch"] = 0
      fs.writeFileSync(FilePath, JSON.stringify(Structure));
      cash["trst"]=0
      cash["msgch"]=0
      return message.reply("stop translation")
    }
    if(command==="help"){
        return message.channel.send({
      embeds: [
        {
          author: {
            name: client.user.name,
          },
          title: `help[${prefix}]`,
          fields: [
                {
                  name: "start",
                  value: `送信されたチャンネルで自動翻訳を開始します。`,
                  inline:true
                },
                {
                  name: "stop",
                  value: `メッセージ自動翻訳機能を停止します。`,
                  inline:true
                },
                {
                  name: "tr [言語] [本文]",
                  value: `メッセージを翻訳します。\n対応言語は[こちら](https://developers.google.com/admin-sdk/directory/v1/)`,
                  inline:false
                }
              ],
          footer: {
            text: "made by maka_7264 ©2023-2024 maka_7264", //適宜変えてください。
          },
          timestamp: new Date(),
        },
      ],
    })
    }
    if(message.content.match("")){
      if(message.content.startsWith(prefix)){
        return
      }//prefixが含まれてたら翻訳しない
      const nickname = message.member.displayName; //webhookのauthorname
      const avatarURL = message.author.avatarURL({dynamic : true}); //webhookのavatar(URLで指定)
      const webhook = await getWebhookInChannel(message.channel);
      if(cash["trst"]===1){
        if(message.channel.id===cash["msgch"]){
          if(message.mentions.members.size > 0){
            var mentionmember = message.mentions.members.first() //メンションされた最初の人を取得
            var trtext = message.content.replace(`<@${mentionmember.user.id}>`,"") //さっき取得したメンションを置き換え(複数メンション非対応(改善の余地あり))
          }else{
            var trtext = message.content
          }
          try{
              var jares = await fetch(`https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec?text=${trtext}&source=&target=${encodeURIComponent("ja")}`).then(res => res.text())
              var enres = await fetch(`https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec?text=${trtext}&source=&target=${encodeURIComponent("en")}`).then(res => res.text())
    if(jares==="[リンク省略]"){
      return
    } //もしリンクのみの場合、Google Apps Scriptでリンクを[リンク省略]に置き換えてるので、リンク省略のみが返された場合はメッセージ送信しない(複数リンク非対応)
    if(message.content===""){
      return
    } //送信されたものが画像だけだったりファイルだけの場合翻訳しない。
    if(jares===""){
      return
    } //さっきと同じ(あまり意味ない。)
    if(enres===""){
      return
    } //さっきと同じ(あまり意味ない。)
    if(jares===enres){
      return
    } //絵文字とか除外(完全ではない。)
    if(jares.match('<H1>Bad Request</H1>')){
      return await webhook.send({
     content : `Cannot translate.`,
     username : `Error`,
     avatarURL : avatarURL,
   })
    } //翻訳でエラーが出た場合除外
    if(jares.match('<title>Error</title>')){
      return await webhook.send({
     content : `Cannot translate.`,
     username : `Error`,
     avatarURL : avatarURL,
   })
   } //翻訳でエラーが出た場合除外(こっちだけでいい感あり)
   //もっといい例外処理の書き方あると思う
    const translatemsg = await webhook.send({
     content : `...`,//とりあえずwebhookの送信(翻訳apiの返答に600msぐらいかかるため)
     username : `from: ${nickname}`,
     avatarURL : avatarURL,
   })
    trmsgid[message.id]=translatemsg.id //キャッシュに保存(ファイルに保存してもいいけど活発なサーバーだと読み込み遅くなると思う。)
    webhook.editMessage(translatemsg.id,`ja: ${jares}\nen: ${enres}`)//さっき送信したwebhookの編集
    }catch(err){console.error(err)}}//エラー出たらコンソールに出力
    }}
  })
client.on('messageDelete', async message => { //メッセージ削除検知的な
   if (!message.guild) return //メッセージ削除されたのがサーバーじゃなければ除外
  if(trmsgid[message.id]===undefined){ //キャッシュに削除されたメッセージのidがなければ除外
    return
  }else{
    await client.channels.cache.get(message.channel.id).messages.cache.get(trmsgid[message.id]).delete() //キャッシュレスに存在するメッセージidからwebhookで送信したメッセージ取得して削除
  }
})
client.on("interactionCreate", async (interaction) => {
  
  if (!interaction.isCommand()) {
    return;
  }//ボタン使うならこれの前にコード書く
  if (interaction.commandName === "ping") {//よくあるやつ(全部ミリ秒)
    cash.timestamp0 = Date.now()
    await interaction.deferReply();
    cash.timestamp = Date.now()
    const webhook = await getWebhookInChannel(interaction.channel);
    const msg = await webhook.send({
     content : `test`,
     username : `test`,
     avatarURL : "https://cdn.discordapp.com/avatars/1190995174030053476/0bbe1045e85da9c0aab26f649f0fc0c6.png?size=1024",
   })
    cash.timestamp1 = Date.now()
    msg
    cash.timestamp2 = Date.now()
    webhook.editMessage(msg.id,"editedmessage")
    cash.timestamp3 = Date.now()
    await client.channels.cache.get(interaction.channel.id).messages.cache.get(msg.id).delete()
    cash.timestamp4 = Date.now()
    await fetch(`https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec?text=${"test"}&source=&target=${encodeURIComponent("ja")}`).then(res => res.text())
    cash.timestamp5 = Date.now()
    return await interaction.editReply({
      content: `EndPoint : ${cash.timestamp0-Date.parse(interaction.createdAt)}(Not so accurate.)\nsendmessage : ${cash.timestamp-cash.timestamp0}\nsendwebhook : ${cash.timestamp3-cash.timestamp}\ndeletemessage : ${cash.timestamp4-cash.timestamp3}\ntranslateapi : ${cash.timestamp5-cash.timestamp4}`,
      ephemeral: false,
    });
  }
  if (interaction.commandName === "automatictranslation") { //自動翻訳の開始終了
    if(cash["trst"]===1){
        var FilePath = "./settings.json";
      var Structure = JSON.parse(fs.readFileSync(FilePath));
      Structure["trst"] = 0;
      Structure["msgch"] = 0
      fs.writeFileSync(FilePath, JSON.stringify(Structure));
    cash["trst"]=0
    cash["msgch"]=0
    return interaction.reply("stop translation")
      }else{
      var FilePath = "./settings.json";
      var Structure = JSON.parse(fs.readFileSync(FilePath));
      Structure["trst"] = 1;
      Structure["msgch"] = interaction.channel.id
      fs.writeFileSync(FilePath, JSON.stringify(Structure));
    cash["trst"]=1
    cash["msgch"]=interaction.channel.id
    return interaction.reply("start translation")
    }
  }
})

client.on('messageUpdate',async (oldMessage,newMessage) => { //メッセージが編集されたことを検知
  if(trmsgid[oldMessage.id]===undefined){ //キャッシュにメッセージidなかったら除外
    return
  }else{
    const webhook = await getWebhookInChannel(oldMessage.channel);
    const translatemsg = trmsgid[oldMessage.id]
    try{
              var jares = await fetch(`https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec?text=${newMessage.content}&source=&target=${encodeURIComponent("ja")}`).then(res => res.text())
    var enres = await fetch(`https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec?text=${newMessage.content}&source=&target=${encodeURIComponent("en")}`).then(res => res.text())
    if(jares==="[リンク省略]"){
      return
    } 
    if(newMessage.content===""){
      return
    }
    if(jares===""){
      return
    }
    if(enres===""){
      return
    }
    if(jares.match('<H1>Bad Request</H1>')){
      return await webhook.editMessage(translatemsg,`Cannot translate.`)
    }
    if(jares.match('<title>Error</title>')){
      return await webhook.editMessage(translatemsg,`Cannot translate.`)
   }
    webhook.editMessage(translatemsg,`ja: ${jares}\nen: ${enres}`)
    }catch(err){console.error(err)}
  }
})


if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log("DISCORD_BOT_TOKENが設定されていません。");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);

async function getWebhookInChannel(channel) {
   //webhookのキャッシュを自前で保持し速度向上
   const webhook = cacheWebhooks.get(channel.id) ?? await getWebhook(channel)
   return webhook;
 }
 
 async function getWebhook(channel) {
   //チャンネル内のWebhookを全て取得
   const webhooks = await channel.fetchWebhooks();
   //tokenがある（＝webhook製作者がbot自身）Webhookを取得、なければ作成する
   const webhook = webhooks?.find((v) => v.token) ?? await channel.createWebhook("Bot Webhook");
   //キャッシュに入れて次回以降使い回す
   if (webhook) cacheWebhooks.set(channel.id, webhook);
   return webhook;
 }