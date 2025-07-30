#!/usr/bin/env node

import { mkdirSync, existsSync, readdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";
import chalk from "chalk";
import ora from "ora";

const log = console.log;
const spinner = ora();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function copySourceCodeRecursively(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copySourceCodeRecursively(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function askQuestion(query: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function findTemplateDirectory(): string {
  const possiblePaths = [
    join(__dirname, "..", "template", "Keypad"),
    join(__dirname, "template", "Keypad"),
    join(dirname(__dirname), "template", "Keypad"),
    join(__dirname, "..", "..", "template", "Keypad"),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  return possiblePaths[0] || join(__dirname, "..", "template", "Keypad");
}

async function runCLI() {
  log(chalk.bold.blueBright("\n🧮 React Native Keypad Component CLI\n"));
  log(chalk.gray("This will add the Keypad component into your project...\n"));

  const input = await askQuestion(
    chalk.cyanBright(
      "Where do you want to add the source code? (default: components/Keypad): "
    )
  );
  const relativePath = input || "components/Keypad";

  const projectRoot = process.cwd();
  const targetDir = join(projectRoot, relativePath);

  const templateDir = findTemplateDirectory();

  spinner.start(`Creating folder: ${relativePath}`);
  mkdirSync(targetDir, { recursive: true });
  spinner.succeed(chalk.green(`Created folder: ${relativePath}`));

  spinner.start("Copying Keypad component files...");

  if (!existsSync(templateDir)) {
    spinner.fail(chalk.red(`Template directory not found!`));
    log(chalk.yellow(`\nDebugging information:`));
    log(chalk.yellow(`- CLI script location: ${__dirname}`));
    log(chalk.yellow(`- Looking for template at: ${templateDir}`));
    log(chalk.yellow(`- Current working directory: ${process.cwd()}`));

    const parentDir = join(__dirname, "..");
    if (existsSync(parentDir)) {
      const contents = readdirSync(parentDir);
      log(chalk.yellow(`- Contents of ${parentDir}:`));
      contents.forEach((item) => log(chalk.yellow(`  - ${item}`)));
    }

    process.exit(1);
  }

  copySourceCodeRecursively(templateDir, targetDir);
  spinner.succeed(chalk.green("Keypad files copied successfully"));

  log(chalk.bold.green("\n✅ Keypad component added!"));
  log(chalk.gray("You can now import it using:\n"));
  log(chalk.cyan(`import Keypad from './${relativePath}';\n`));
}

runCLI();
