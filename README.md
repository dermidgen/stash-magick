# Stash Magick
This project seeks to abstract various libraries that support ImageMagick operations against streams in Nodejs
and provide a simple service for managing an image stash that stores multiple versions of an original image.

## Use Case
A developer wishes to accept user-uploaded images, but store them in a uniform way for subsequent retrieval or
display. Furthermore, the developer wishes to also generate and store thumbnails or other modified versions of the
original.

# Goals

* Provide Common API service
    - CORS compliance support
    - Streams wherever possible
    - Support image uploads
    - Support image and stash metadata retrieval
    - Support defined ImagicMagick operations against upload streams
       + Crop
       + Flip
       + Resample
       + Resize
       + Rotate
       + Scale
    - Support backend utility and "stash" management operations
    - Take advantage of stream splitting to generate multiple variants in parallel
* Provide Image Stash Management
    - Support image storage and retriveal across multiple backend providers
     - Rackspace
     - AWS
     - Google
     - Local filesystem
    - Support image versioning and variants
    - Support defined storage schema(s)

## Future considerations

* Security
* Scaling
  - ImageMagick workloads - threading?
  - HTTP sockets
