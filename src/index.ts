#!/usr/bin/env bun

import { mkdirSync, existsSync, readdirSync, copyFileSync } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import chalk from "chalk";
import ora from "ora";

const log = console.log;
const spinner = ora();

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
  const templateDir = join(import.meta.dir, "..", "template", "Keypad");

  spinner.start(`Creating folder: ${relativePath}`);
  mkdirSync(targetDir, { recursive: true });
  spinner.succeed(chalk.green(`Created folder: ${relativePath}`));

  spinner.start("Copying Keypad component files...");
  copySourceCodeRecursively(templateDir, targetDir);
  spinner.succeed(chalk.green("Keypad files copied successfully"));

  log(chalk.bold.green("\n✅ Keypad component added!"));
  log(chalk.gray("You can now import it using:\n"));
  log(chalk.cyan(`import Keypad from './${relativePath}';\n`));
}

runCLI();
