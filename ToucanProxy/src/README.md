# README

## Notes:
To run the worker on localhost:

`npx wrangler dev`

If an exception in thrown somewhere in the worker, will get a not very descriptive "500 Internal Server Error". Add a try-catch to find the error source. Stack-trace line numbers may be wrong.
