# -*- coding: UTF-8 -*-
import os
import shutil

root_dir = os.getcwd()
proj_dir = os.path.join(root_dir, 'WebApp')

print('remove __ConfigTemp directory:')
config_temp_dir = os.path.join(proj_dir, '__ConfigTemp')
if (os.path.exists(config_temp_dir)):
    shutil.rmtree(config_temp_dir)

print('clean MVCClientApp directory:')
build_temp_dir = os.path.join(root_dir, 'build\\MVCClientApp')
if (os.path.exists(build_temp_dir)):
    shutil.rmtree(build_temp_dir)

print('compile starting:')
os.system('aspnet_compiler -v / -u -c -nologo -p ' + proj_dir + ' ' + build_temp_dir)

print('copy bin directory:')
src_bin_dir = os.path.join(build_temp_dir, 'bin')
dest_bin_dir = os.path.join(proj_dir, 'bin')
if (os.path.exists(dest_bin_dir)):
    shutil.rmtree(dest_bin_dir)
shutil.copytree(src_bin_dir, dest_bin_dir)

print('Compile success!')
