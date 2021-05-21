# info

# help: Help for this project

help: Makefile
   @echo "Usage:\n  make [command]"
   @echo
   @echo "Available Commands:"
   @sed -n 's/^##//p' $< | column -t -s ':' |  sed -e 's/^/ /'

## build: Compile the binary. Copy binary product to current directory

# build:
#    @sh build.sh

## run: Build and run, run command `train cnn` by default

# run: build
#    @sh output/bootstrap.sh
run: nohup python3 manage.py runserver 0.0.0.0:8080 >djo.out 2>&1 &
## clean: Clean output

clean:
   rm -rf djo.out
   # rm -f toad_ocr_engine

## generate: generate idl code

# generate:
#    @sh idl_generate.sh