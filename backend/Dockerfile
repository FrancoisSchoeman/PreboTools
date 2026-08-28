###########
# BUILDER #
###########

FROM python:3.12 as builder

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      gcc \
      default-libmysqlclient-dev \
      pkg-config \
      ca-certificates \
      curl \
      gnupg && \
    rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt

#########
# FINAL #
#########

FROM python:3.12

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      default-libmysqlclient-dev \
      libmariadb3 && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/app
RUN addgroup --system app && adduser --system --ingroup app app

ENV PATH="${PATH}:/home/app/.local/bin:/usr/local/bin"
ENV HOME=/home/app
ENV APP_HOME=/home/app/web
RUN mkdir -p $APP_HOME/static $APP_HOME/staticfiles $APP_HOME/media
WORKDIR $APP_HOME

COPY --from=builder /usr/src/app/wheels /wheels
COPY --from=builder /usr/src/app/requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache /wheels/*

COPY . $APP_HOME

RUN chown -R app:app $APP_HOME

USER app

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn --timeout 300 --workers 5 backend.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
