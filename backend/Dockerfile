FROM python:3.12

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container to /app
WORKDIR /app

# Add the current directory files (on your machine) to the container
ADD . /app/

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose the port server is running on
EXPOSE 8002

# Start the server
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8002"]

# docker build -t backend .

# docker run -p 8002:8002 backend

# ###########
# # BUILDER #
# ###########

# # pull official base image
# FROM python:3.12 as builder

# # set work directory
# WORKDIR /usr/src/app

# # set environment variables
# ENV PYTHONDONTWRITEBYTECODE 1
# ENV PYTHONUNBUFFERED 1

# # install system dependencies
# RUN apt-get update && \
#     apt-get install -y --no-install-recommends gcc ca-certificates curl gnupg

# # install python dependencies
# COPY ./requirements.txt .
# RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt

# #########
# # FINAL #
# #########

# # pull official base image
# FROM python:3.12

# # create directory for the app user
# RUN mkdir -p /home/app

# # create the app user
# RUN addgroup --system app && adduser --system --ingroup app app

# # create the appropriate directories
# ENV PATH="${PATH}:/home/app/.local/bin:/usr/local/bin"
# ENV HOME=/home/app
# ENV APP_HOME=/home/app/web
# RUN mkdir -p $APP_HOME/static $APP_HOME/staticfiles $APP_HOME/mediafiles
# WORKDIR $APP_HOME

# COPY --from=builder /usr/src/app/wheels /wheels
# COPY --from=builder /usr/src/app/requirements.txt .
# RUN pip install --upgrade pip
# RUN pip install --no-cache /wheels/*

# # copy project
# COPY . $APP_HOME

# # chown all the files to the app user
# RUN chown -R app:app $APP_HOME

# # change to the app user
# USER app

# # Add an entrypoint or CMD if needed to run your application
# # Example:
# # CMD ["gunicorn", "--bind", "0.0.0.0:8002", "myproject.wsgi:application"]