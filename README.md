# Meal Log

[![build](https://github.com/evanpurkhiser/meal-log/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/evanpurkhiser/meal-log/actions/workflows/main.yml)

Small personal side project designed to work with iOS shortcuts that help
easily track what I am eating.

The workflow is:

1. Use an iOS shortcut on the iPhone action button to quickly record photos of
   everything you eat into a specific photo album.

2. Use a iOS shortcut automation to upload the last 24 hours worth of photos
   every night.

3. This server takes those photos, ships them over to OpenAI to record tags and
   details about each meal and stores the details into a database.
