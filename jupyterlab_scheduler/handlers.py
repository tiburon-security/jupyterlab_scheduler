import os
import json
import re
from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
import tornado
from tornado.web import StaticFileHandler
from crontab import CronTab


class AllJobs(APIHandler):

    @tornado.web.authenticated
    def get(self):
        try:

            data = []

            cron = CronTab(user=os.environ["USER"])
    
            for job in cron:
                if("jupyterlab_scheduler job" in job.comment):

                    try:
                        command_match = re.search(r"(?:^.*\[Cronjob executing\]\"\s>>.*&&\s)(.*?)(?:\s>>)", job.command)
                        command = command_match.group(1)

                        log_file_match = re.search(r"(?:>\s)([\/A-Za-z_\-\d+]+\.log)", job.command)
                        log_file = log_file_match.group(1)

                        script_match = re.search(r"(?:script:\s)(.*)", job.comment)
                        script = script_match.group(1)

                        schedule_match = re.search(r"(((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7}", str(job))
                        schedule = schedule_match.group(0)

                        data.append({
                            "command": command,
                            "log_file": log_file,
                            "script": script,
                            "raw": str(job),
                            "schedule":schedule
                        })

                    except AttributeError:
                        # something epically failed and the cron isn't formatted to our pre-defined structure
                        pass

            self.finish(json.dumps({
                "success": True,
                "data": data
            }))

            return

        except FileNotFoundError:
            self.finish(json.dumps({
                "success" : True,
                "data": [] 
            }))
            return


class DeleteJob(APIHandler):
    @tornado.web.authenticated
    def post(self):

        input_data = self.get_json_body()

        job_command = input_data["command"]
        job_schedule = input_data["schedule"]

        with CronTab(user=os.environ["USER"]) as cron:

            for job in cron:
                try:

                    command_match = re.search(r"(?:^.*\[Cronjob executing\]\"\s>>.*&&\s)(.*?)(?:\s>>)", job.command)
                    command = command_match.group(1)

                    schedule_match = re.search(r"(((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7}", str(job))
                    schedule = schedule_match.group(0)

                    if(job_schedule == schedule and job_command == command):
                        cron.remove(job)
                        self.finish(json.dumps({"success": True}))
                        return


                except AttributeError:
                    pass

        self.finish(json.dumps({"success": False}))
        return
        

class AddJob(APIHandler):

    @tornado.web.authenticated
    def post(self):

        input_data = self.get_json_body()

        schedule = input_data["schedule"]
        script = input_data["script"]
        command = input_data["command"]

        cleaned_script_name = re.sub(r"[\.\s\<\>\|\\\:\(\)\&\;]", '_', script)
        comment = "jupyterlab_scheduler job script: {}".format(script)

        command_prefix_portion = "echo \"`date` [Cronjob executing]\" >> /tmp/{}.log &&".format(cleaned_script_name)
        command_log_portion = ">> /tmp/{}.log 2>&1".format(cleaned_script_name)
     
        with CronTab(user=os.environ["USER"]) as cron:
            for key, value in os.environ.items():
                cron.env[key] = value
            
            job = cron.new(command="{} {} {}".format(command_prefix_portion, command, command_log_portion), comment=comment)
            job.setall(schedule)


        self.finish(json.dumps({"success": True}))
        return


class ViewLog(APIHandler):
    @tornado.web.authenticated
    def get(self):

        job_command = self.get_argument("command")
        job_schedule = self.get_argument("schedule")

        with CronTab(user=os.environ["USER"]) as cron:
            
            for job in cron:
                try:

                    command_match = re.search(r"(?:^.*\[Cronjob executing\]\"\s>>.*&&\s)(.*?)(?:\s>>)", job.command)
                    command = command_match.group(1)

                    schedule_match = re.search(r"(((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7}", str(job))
                    schedule = schedule_match.group(0)

                    if(job_schedule.strip() == schedule.strip() and job_command == command):
                        script_match = re.search(r"(?:script:\s)(.*)", job.comment)
                        script = script_match.group(1)

                        cleaned_script_name = re.sub(r"[\.\s\<\>\|\\\:\(\)\&\;]", '_', script)

                        with open("/tmp/{}.log".format(cleaned_script_name)) as f:
                            lines = f.read().splitlines()
                            lines.reverse()

                            data = lines[0:200]

                            self.finish(json.dumps({"success": True, "data": data}))
                            return


                except AttributeError:
                    pass

        self.finish(json.dumps({"success": False}))
        return


def setup_handlers(web_app, url_path):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    # Prepend the base_url so that it works in a jupyterhub setting
    handlers = [
        (url_path_join(base_url, url_path, "list"), AllJobs),
        (url_path_join(base_url, url_path, "add"), AddJob),
        (url_path_join(base_url, url_path, "delete"), DeleteJob),
        (url_path_join(base_url, url_path, "log"), ViewLog)
    ]

    web_app.add_handlers(host_pattern, handlers)

    # Prepend the base_url so that it works in a jupyterhub setting
    doc_url = url_path_join(base_url, url_path, "static")
    doc_dir = os.getenv(
        "JLAB_SERVER_EXAMPLE_STATIC_DIR",
        os.path.join(os.path.dirname(__file__), "static"),
    )
    handlers = [("{}/(.*)".format(doc_url), StaticFileHandler, {"path": doc_dir})]
    web_app.add_handlers(".*$", handlers)
