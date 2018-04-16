FROM node:9

# Configure yarn
ENV YARN_CACHE='/var/cache/yarn'
ENV PATH=/root/.yarn/bin:$PATH

# Install yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash

# Install typescript and ts-node globally
RUN yarn global add typescript ts-node

# Install nodemon globally
RUN yarn global add nodemon