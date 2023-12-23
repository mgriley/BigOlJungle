#!/usr/bin/env python3

import zipfile 
import sys
import argparse
import copy
import json
from pathlib import Path

kExtFiles = [
  'README.md',
  'background.js',
  'content.js',
  'browser-polyfill.js',
  'icons/icon-48.png',
  'icons/icon-96.png',
]

def readFile(path):
  with open(path, 'r') as file:
    return file.read()

def readExtVersion(manifestFile):
  return json.loads(readFile(manifestFile))["version"]

def createZip(inputFiles, outputFile):
  with zipfile.ZipFile(outputFile, 'w') as theZip:
    for entry in inputFiles:
      print("Writing: {}".format(entry))
      if type(entry) is str:
        theZip.write(entry, arcname=entry)
      elif type(entry) is dict:
        theZip.write(entry['infile'], entry['outfile'])

def unpackZip(zipPath):
  with zipfile.ZipFile(zipPath, "r") as zipRef:
    dirPath = Path(zipPath).with_suffix('')
    print("Unzipping to {}".format(dirPath)) 
    zipRef.extractall(dirPath)

def main():
  parser = argparse.ArgumentParser(
      prog="PackageUtil",
      description="Package the browser extension for diff platforms")
  parser.add_argument('--platform', help='firefox, chrome, or safari')
  args = parser.parse_args()

  manifestMap = {
      "firefox": "manifest.json",
      "chrome": "manifest_chrome.json",
      "safari": "manifest_safari.json",
  }
  assert(args.platform in manifestMap)
  platformManifest = manifestMap[args.platform]

  extFiles = copy.copy(kExtFiles)
  extFiles.append({'infile': platformManifest, 'outfile': "manifest.json"})
  extVersion = readExtVersion(platformManifest)
  zipName = "artifacts/jungleext-{}-{}.zip".format(args.platform, extVersion)
  print("Creating zip: {}".format(zipName))
  createZip(extFiles, zipName)
  unpackZip(zipName)
  print("Done!")

  return 0

if __name__ == "__main__":
  sys.exit(main())

