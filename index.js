#!/usr/bin/env node

const axios = require('axios');
const plist = require('plist');
const shell = require('shelljs');
const prettyBytes = require('pretty-bytes');
const readline = require('readline-sync');
const fs = require('fs');

async function pull_macos_catalog(macos_catalog_url, save_folder_path) {
  console.log(`\nCatalog: ${macos_catalog_url}\n`);
  shell.cd(save_folder_path);

  var transferred_count = 0;
  var total_catalog_size = 0;
  var total_transfer_size = 0;
  var total_package_count = 0;

  // get catalog
  let catalog = await axios.get(macos_catalog_url);
  let catalog_content = plist.parse(catalog.data).Products;

  // calculate size & item count
  for (let products in catalog_content) {
    for (let packages in (catalog_content[products].Packages)) {
      let package_size = catalog_content[products].Packages[packages].Size;
      total_catalog_size = total_catalog_size + parseFloat(package_size);
      total_package_count = total_package_count + 1;
    }
  }

  let total_size_readable = prettyBytes(total_catalog_size);

  for (let products in catalog_content) {
    for (let packages in (catalog_content[products].Packages)) {
      let download_url = catalog_content[products].Packages[packages].URL;
      let package_size = catalog_content[products].Packages[packages].Size;

      total_transfer_size = total_transfer_size + parseFloat(package_size);

      console.log(`\n> Transferring Package #${transferred_count}: ${download_url} \n`);

      // download
      shell.exec(`curl -O "${download_url}"`);

      // show statistics
      console.log(`\n+ ${prettyBytes(total_transfer_size).replace(' ', '')}/${total_size_readable.replace(' ', '')} (${transferred_count} / ${total_package_count}) completed.`);

      transferred_count = transferred_count + 1;
    }
  }
  console.log(`=========================================`);
  console.log(`OPERATION HAS COMPLETED.`);
  process.exit(0);
}

function start() {
  shell.exec(`clear`);

  // Print URLs

  console.log(`==============================`);
  console.log(`# CHOOSE AN OS CATALOG URL. #`);
  console.log(`==============================`);
  console.log(`1. OS X 10.4 Tiger`);
  console.log(`2. OS X 10.5 Leopard`);
  console.log(`3. OS X 10.6 Snow Leopard`);
  console.log(`4. OS X 10.7 Lion`);
  console.log(`5. OS X 10.8 Mountain Lion`);
  console.log(`6. OS X 10.9 Mavericks`);
  console.log(`7. OS X 10.10 Yosemite`);
  console.log(`8. OS X 10.11 El Capitan`);
  console.log(`9. macOS 10.12 Sierra`);
  console.log(`10. macOS 10.13 High Sierra`);
  console.log(`11. macOS 10.14 Mojave`);
  console.log(`12. macOS 10.15 Catalian`);
  console.log(`13. macOS 11 Big Sur`);
  console.log(`14. macOS 12 Monterey`);

  let os = [
    "tiger",
    "leopard",
    "snowleopard",
    "lion",
    "mountainlion",
    "mavericks",
    "yosemite",
    "elcapitan",
    "sierra",
    "highsierra",
    "mojave",
    "catalina",
    "bigsur",
    "monterey"
  ]

  // Ask for catalog url number

  let catalog_int = readline.question('\nEnter a catalog url number: ');

  if (!os[parseInt(catalog_int.replace(/[^0-9]/g, "")) - 1]) return console.error("\nInvalid option. Please try again.")

  const os_json = require(`./catalogs/${os[parseInt(catalog_int.replace(/[^0-9]/g, "")) - 1]}.json`)

  // Print catalog types

  console.log(`\n==========================`);
  console.log(`# CHOOSE A CATALOG TYPE. #`);
  console.log(`===========================`);

  var opt_count = 1;

  for (let urls in os_json) {
    console.log(`${opt_count}. ${urls}`);
    opt_count++;
  }

  // Ask for catalog types number

  let type_int = readline.question('\nEnter a catalog type number: ');

  if (!Object.keys(os_json)[parseInt(type_int.replace(/[^0-9]/g, "")) - 1]) return console.error("\nInvalid option. Please try again.")

  // Ask for save folder path
  console.log(`\n==========================`);
  console.log(`# ENTER SAVE FOLDER PATH. #`);
  console.log(`===========================\n`);

  let save_folder_path = readline.question('Enter a save folder path: ');

  if (!fs.existsSync(save_folder_path)) return console.error('\nThe specified directory does not exist.');

  // Run!
  console.log(`\n==========================`);
  pull_macos_catalog(os_json[Object.keys(os_json)[parseInt(type_int.replace(/[^0-9]/g, "")) - 1]], save_folder_path);
}

start();