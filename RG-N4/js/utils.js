function constructSphere(stacks, slices, positions, normals, uvs){
        if (stacks < 2 || slices < 2)
            return;
        var stack_angle = Math.PI / stacks, slice_angle = 2.0 * Math.PI / slices;
        var index = 0;
        var quad = [];
        for (i = 0; i <= stacks; ++i) {
            for (j = 0; j <= slices; ++j) {
                var r1 = Math.sin(i * stack_angle), r2 = Math.sin((i+1) * stack_angle);

                quad[0] = [ r1 * Math.sin(j * slice_angle), -Math.cos(i * stack_angle), r1 * Math.cos(j * slice_angle) ];
                quad[1] = [ r1 * Math.sin((j+1) * slice_angle), -Math.cos(i * stack_angle), r1 * Math.cos((j+1) * slice_angle) ];
                quad[2] = [ r2 * Math.sin((j+1) * slice_angle), -Math.cos((i+1) * stack_angle), r2 * Math.cos((j+1) * slice_angle) ];
                quad[3] = [ r2 * Math.sin(j * slice_angle), -Math.cos((i+1) * stack_angle), r2 * Math.cos(j * slice_angle) ];

                positions[index] = quad[0];
                positions[index + 1] = quad[1];
                positions[index + 2] = quad[3];
                positions[index + 3] = quad[3];
                positions[index + 4] = quad[1];
                positions[index + 5] = quad[2];

                normals[index] = quad[0];
                normals[index + 1] = quad[1];
                normals[index + 2] = quad[3];
                normals[index + 3] = quad[3];
                normals[index + 4] = quad[1];
                normals[index + 5] = quad[2];

                var u1 = parseFloat(j) / slices, u2 = parseFloat(j+1) / slices;
                var v1 = parseFloat(i) / stacks, v2 = parseFloat(i+1) / stacks;
                uvs[2 * index] = u1;
                uvs[2 * index + 1] = v1;
                uvs[2 * index + 2] = u2;
                uvs[2 * index + 3] = v1;
                uvs[2 * index + 4] = u1;
                uvs[2 * index + 5] = v2;
                uvs[2 * index + 6] = u1;
                uvs[2 * index + 7] = v2;
                uvs[2 * index + 8] = u2;
                uvs[2 * index + 9] = v1;
                uvs[2 * index + 10] = u2;
                uvs[2 * index + 11] = v2;

                index += 6;
            }
        }
        sphere_pos = [].concat.apply([], sphere_pos);
        sphere_norm = [].concat.apply([], sphere_norm);
        sphere_uv = [].concat.apply([], sphere_uv);
    }